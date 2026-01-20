import { PrismaClient } from "../src/generated/prisma";
import { SubscriptionState } from "../src/models/models";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { addMonths, subMonths } from "date-fns";

// const adapter = new PrismaBetterSqlite3({
//   url: process.env.DATABASE_URL!,
// });
const prisma = new PrismaClient();

async function main() {
  await prisma.subscription.deleteMany();
  await prisma.rentalPlan.deleteMany();
  await prisma.product.deleteMany();

  // Products (use titles closer to your mock if you like)
  const phone = await prisma.product.create({
    data: {
      slug: "phone-max",
      title: "Phone Max",
      coreAttribute: '6.7" OLED, Triple Rear Camera, 6GB RAM, 5G',
      image: "/products/phone-max.png",
      rentalPlans: {
        create: [
          { period: 1, price: 1999 },
          { period: 3, price: 5499 },
          { period: 6, price: 9999 },
          { period: 12, price: 17999 },
        ],
      },
    },
  });

  const camera = await prisma.product.create({
    data: {
      slug: "pro-camera",
      title: "Pro Camera",
      coreAttribute: "24.2 MP, 4K video, 5-axis stabilization",
      image: "/products/pro-camera.png",
      rentalPlans: {
        create: [
          { period: 1, price: 2499 },
          { period: 3, price: 6999 },
          { period: 6, price: 12499 },
          { period: 12, price: 22999 },
        ],
      },
    },
  });

  const scooter = await prisma.product.create({
    data: {
      slug: "e-scooter",
      title: "Reach E-Scooter",
      coreAttribute: "Foldable, 20 km/h, 250W motor",
      image: "/products/e-scooter.png",
      rentalPlans: {
        create: [
          { period: 1, price: 1890 },
          { period: 3, price: 5490 },
          { period: 6, price: 8990 },
          { period: 12, price: 14990 },
        ],
      },
    },
  });

  const now = new Date();

  // 1) ENDED subscription (TERMINATED)
  // Activated 4 months ago, lasted 3 months, ended 1 month ago
  const endedActivatedAt = subMonths(now, 4);
  const endedActiveUntil = addMonths(endedActivatedAt, 3);
  const endedTerminatedAt = subMonths(now, 1);

  await prisma.subscription.create({
    data: {
      state: SubscriptionState.TERMINATED,
      referenceId: "G-CAM-ENDED",
      rentalPeriod: 3,
      monthlyPrice: 6999,
      activatedAt: endedActivatedAt,
      activeUntil: endedActiveUntil,
      terminatedAt: endedTerminatedAt,
      terminationReason: "ENDED",
      terminationComment: null,
      productId: camera.id,
    },
  });

  // 2) EXTENDABLE subscription (ACTIVE) - 3 months, can extend to 6/12
  await prisma.subscription.create({
    data: {
      state: SubscriptionState.ACTIVE,
      referenceId: "G-PHONE-3M",
      rentalPeriod: 3,
      monthlyPrice: 5499,
      activatedAt: now,
      activeUntil: addMonths(now, 3),
      terminatedAt: null,
      terminationReason: null,
      terminationComment: null,
      productId: phone.id,
    },
  });

  // 3) NOT EXTENDABLE subscription (ACTIVE but already max period = 12)
  // UI should show no valid extension options (or button disabled)
  await prisma.subscription.create({
    data: {
      state: SubscriptionState.ACTIVE,
      referenceId: "G-SCOOTER-12M",
      rentalPeriod: 12,
      monthlyPrice: 14990,
      activatedAt: now,
      activeUntil: addMonths(now, 12),
      terminatedAt: null,
      terminationReason: null,
      terminationComment: null,
      productId: scooter.id,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
