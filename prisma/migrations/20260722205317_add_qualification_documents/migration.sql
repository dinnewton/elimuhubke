-- CreateTable
CREATE TABLE "QualificationDocument" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QualificationDocument_teacherId_idx" ON "QualificationDocument"("teacherId");

-- AddForeignKey
ALTER TABLE "QualificationDocument" ADD CONSTRAINT "QualificationDocument_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "TeacherProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
