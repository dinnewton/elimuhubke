import "server-only";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

export type StorageCategory = "documents" | "exercises" | "submissions" | "qualifications";

const R2_BUCKET = process.env.R2_BUCKET_NAME;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

// Falls back to local disk (uploads/) when R2 credentials aren't configured —
// same "sandbox by default" pattern as src/lib/mpesa.ts, so local dev needs
// no cloud account. Set the R2_* env vars to switch to real object storage.
export const remoteStorageEnabled = Boolean(
  R2_BUCKET && R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY
);

const s3 = remoteStorageEnabled
  ? new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const LOCAL_ROOT = path.join(process.cwd(), "uploads");

function localPath(key: string) {
  return path.join(LOCAL_ROOT, ...key.split("/"));
}

// Stores an uploaded File and returns its storage key, e.g. "documents/<uuid>.pdf".
// The key is what gets saved in the DB (Document.fileUrl, Exercise.fileUrl, etc.)
// and is opaque to callers — always retrieve bytes via readStoredFile(key).
export async function storeFile(category: StorageCategory, file: File): Promise<string> {
  const ext = path.extname(file.name) || "";
  const key = `${category}/${randomUUID()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  if (remoteStorageEnabled && s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: file.type || "application/octet-stream",
      })
    );
    return key;
  }

  await mkdir(path.join(LOCAL_ROOT, category), { recursive: true });
  await writeFile(localPath(key), bytes);
  return key;
}

export async function readStoredFile(key: string): Promise<Buffer> {
  if (remoteStorageEnabled && s3) {
    const res = await s3.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    const bytes = await res.Body!.transformToByteArray();
    return Buffer.from(bytes);
  }
  return readFile(localPath(key));
}

export async function deleteStoredFile(key: string): Promise<void> {
  if (remoteStorageEnabled && s3) {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return;
  }
  const { unlink } = await import("node:fs/promises");
  await unlink(localPath(key)).catch(() => {});
}
