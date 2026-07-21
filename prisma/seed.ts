import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/password";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const db = new PrismaClient({ adapter });

async function main() {
  await db.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", commissionPercent: 20 },
  });

  const subjectDefs = [
    { name: "Mathematics", curriculum: "CBC" as const, gradeLevel: "Grade 6", rate: 700 },
    { name: "English", curriculum: "CBC" as const, gradeLevel: "Grade 6", rate: 650 },
    { name: "Integrated Science", curriculum: "CBC" as const, gradeLevel: "Grade 8", rate: 750 },
    { name: "Kiswahili", curriculum: "CBC" as const, gradeLevel: "Grade 6", rate: 650 },
    { name: "Mathematics", curriculum: "EIGHT_FOUR_FOUR" as const, gradeLevel: "Form 2", rate: 700 },
    { name: "Chemistry", curriculum: "EIGHT_FOUR_FOUR" as const, gradeLevel: "Form 4", rate: 900 },
    { name: "English", curriculum: "EIGHT_FOUR_FOUR" as const, gradeLevel: "Form 2", rate: 650 },
    { name: "Mathematics", curriculum: "IGCSE" as const, gradeLevel: "Year 10 (IGCSE)", rate: 1200 },
    { name: "Biology", curriculum: "IGCSE" as const, gradeLevel: "Year 11 (IGCSE)", rate: 1300 },
    { name: "English Language Arts", curriculum: "AMERICAN" as const, gradeLevel: "Grade 8", rate: 1100 },
    { name: "Algebra", curriculum: "AMERICAN" as const, gradeLevel: "Grade 9", rate: 1100 },
    { name: "Mathematics", curriculum: "IB" as const, gradeLevel: "MYP 4", rate: 1300 },
    { name: "Theory of Knowledge", curriculum: "IB" as const, gradeLevel: "DP 1", rate: 1400 },
    { name: "Conversational Swahili", curriculum: "SWAHILI_FOREIGN" as const, gradeLevel: "Beginner", rate: 1500 },
    { name: "Swahili for Travel & Daily Life", curriculum: "SWAHILI_FOREIGN" as const, gradeLevel: "Absolute beginner", rate: 1500 },
  ];

  const subjects = [];
  for (const def of subjectDefs) {
    const subject = await db.subject.upsert({
      where: {
        name_curriculum_gradeLevel: {
          name: def.name,
          curriculum: def.curriculum,
          gradeLevel: def.gradeLevel,
        },
      },
      update: {},
      create: {
        name: def.name,
        curriculum: def.curriculum,
        gradeLevel: def.gradeLevel,
        rateCard: { create: { hourlyRateKES: def.rate } },
      },
    });
    subjects.push(subject);
  }

  const adminPassword = await hashPassword("Admin1234!");
  await db.user.upsert({
    where: { email: "admin@tusome.com" },
    update: {},
    create: {
      name: "Tusome Admin",
      email: "admin@tusome.com",
      phone: "254700000001",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const teacherPassword = await hashPassword("Teacher1234!");
  const teacherUser = await db.user.upsert({
    where: { email: "teacher@tusome.com" },
    update: {},
    create: {
      name: "Faith Wanjiru",
      email: "teacher@tusome.com",
      phone: "254700000002",
      passwordHash: teacherPassword,
      role: "TEACHER",
      teacherProfile: {
        create: {
          bio: "6 years teaching CBC and 8-4-4 Mathematics and Sciences. Patient, exam-focused, and fluent in English & Kiswahili.",
          curricula: ["CBC", "EIGHT_FOUR_FOUR"],
          verificationStatus: "VERIFIED",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const teacherProfile = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: teacherUser.id },
  });

  const mathsCbc6 = subjects.find(
    (s) => s.name === "Mathematics" && s.curriculum === "CBC" && s.gradeLevel === "Grade 6"
  )!;
  const mathsForm2 = subjects.find(
    (s) => s.name === "Mathematics" && s.curriculum === "EIGHT_FOUR_FOUR" && s.gradeLevel === "Form 2"
  )!;

  for (const subject of [mathsCbc6, mathsForm2]) {
    await db.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId: teacherProfile.id, subjectId: subject.id } },
      update: {},
      create: { teacherId: teacherProfile.id, subjectId: subject.id },
    });
  }

  const now = new Date();
  for (let i = 1; i <= 4; i++) {
    const startsAt = new Date(now);
    startsAt.setDate(startsAt.getDate() + i);
    startsAt.setHours(15, 0, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setHours(startsAt.getHours() + 1);

    const exists = await db.availability.findFirst({
      where: { teacherId: teacherProfile.id, startsAt },
    });
    if (!exists) {
      await db.availability.create({
        data: { teacherId: teacherProfile.id, startsAt, endsAt },
      });
    }
  }

  await db.document.upsert({
    where: { id: "seed-doc-maths-grade6" },
    update: {},
    create: {
      id: "seed-doc-maths-grade6",
      teacherId: teacherProfile.id,
      subjectId: mathsCbc6.id,
      title: "Grade 6 Mathematics Revision Notes",
      description: "Full-term revision notes covering fractions, decimals, and geometry.",
      fileUrl: "placeholder.txt",
      fileSizeBytes: 12,
      priceKES: 150,
    },
  });

  // Second teacher: Swahili for international visitors, expats & diaspora
  const swahiliTeacherPassword = await hashPassword("Teacher1234!");
  const swahiliTeacherUser = await db.user.upsert({
    where: { email: "swahili@tusome.com" },
    update: {},
    create: {
      name: "Amina Hassan",
      email: "swahili@tusome.com",
      phone: "254700000004",
      passwordHash: swahiliTeacherPassword,
      role: "TEACHER",
      teacherProfile: {
        create: {
          bio: "Swahili language coach for visitors, expats, and diaspora Kenyans. 8 years teaching conversational and practical Swahili for travel, work, and daily life.",
          curricula: ["SWAHILI_FOREIGN"],
          verificationStatus: "VERIFIED",
        },
      },
    },
    include: { teacherProfile: true },
  });

  const swahiliTeacherProfile = await db.teacherProfile.findUniqueOrThrow({
    where: { userId: swahiliTeacherUser.id },
  });

  const conversationalSwahili = subjects.find(
    (s) => s.name === "Conversational Swahili" && s.curriculum === "SWAHILI_FOREIGN"
  )!;
  const travelSwahili = subjects.find(
    (s) => s.name === "Swahili for Travel & Daily Life" && s.curriculum === "SWAHILI_FOREIGN"
  )!;

  for (const subject of [conversationalSwahili, travelSwahili]) {
    await db.teacherSubject.upsert({
      where: {
        teacherId_subjectId: { teacherId: swahiliTeacherProfile.id, subjectId: subject.id },
      },
      update: {},
      create: { teacherId: swahiliTeacherProfile.id, subjectId: subject.id },
    });
  }

  for (let i = 1; i <= 4; i++) {
    const startsAt = new Date(now);
    startsAt.setDate(startsAt.getDate() + i);
    startsAt.setHours(9, 0, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setHours(startsAt.getHours() + 1);

    const exists = await db.availability.findFirst({
      where: { teacherId: swahiliTeacherProfile.id, startsAt },
    });
    if (!exists) {
      await db.availability.create({
        data: { teacherId: swahiliTeacherProfile.id, startsAt, endsAt },
      });
    }
  }

  await db.document.upsert({
    where: { id: "seed-doc-swahili-phrasebook" },
    update: {},
    create: {
      id: "seed-doc-swahili-phrasebook",
      teacherId: swahiliTeacherProfile.id,
      subjectId: travelSwahili.id,
      title: "Everyday Swahili Phrasebook for Visitors",
      description: "Essential greetings, market bargaining, and travel phrases with pronunciation guides.",
      fileUrl: "placeholder.txt",
      fileSizeBytes: 12,
      priceKES: 200,
    },
  });

  const studentPassword = await hashPassword("Student1234!");
  await db.user.upsert({
    where: { email: "student@tusome.com" },
    update: {},
    create: {
      name: "Brian Otieno",
      email: "student@tusome.com",
      phone: "254700000003",
      passwordHash: studentPassword,
      role: "STUDENT",
      studentProfile: {
        create: { curriculum: "CBC", gradeLevel: "Grade 6" },
      },
    },
  });

  // International visitor learning Swahili
  const internationalStudentPassword = await hashPassword("Student1234!");
  await db.user.upsert({
    where: { email: "visitor@tusome.com" },
    update: {},
    create: {
      name: "James Miller",
      email: "visitor@tusome.com",
      phone: "254700000005",
      passwordHash: internationalStudentPassword,
      role: "STUDENT",
      studentProfile: {
        create: { curriculum: "SWAHILI_FOREIGN", gradeLevel: "Absolute beginner" },
      },
    },
  });

  console.log("\nSeed complete. Demo logins:");
  console.log("  Admin:              admin@tusome.com    / Admin1234!");
  console.log("  Teacher (CBC/8-4-4): teacher@tusome.com / Teacher1234!");
  console.log("  Teacher (Swahili):   swahili@tusome.com / Teacher1234!");
  console.log("  Student (CBC):       student@tusome.com / Student1234!");
  console.log("  Student (visitor):   visitor@tusome.com / Student1234!\n");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
