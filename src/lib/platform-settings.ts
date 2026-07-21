import { db } from "@/lib/db";

const SETTINGS_ID = "singleton";

export async function getPlatformSettings() {
  const existing = await db.platformSettings.findUnique({
    where: { id: SETTINGS_ID },
  });
  if (existing) return existing;

  const defaultPercent = Number(process.env.PLATFORM_COMMISSION_PERCENT ?? 20);
  return db.platformSettings.create({
    data: { id: SETTINGS_ID, commissionPercent: defaultPercent },
  });
}

export async function setCommissionPercent(percent: number) {
  return db.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { commissionPercent: percent },
    create: { id: SETTINGS_ID, commissionPercent: percent },
  });
}
