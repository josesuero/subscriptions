import { PrismaClient, SubscriptionState } from "@prisma/client";
import { addMonths } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  await prisma.subscription.deleteMany();
  await prisma.rentalPlan.deleteMany();
  await prisma.product.deleteMany();

  const phone = await prisma.product.create({
    data: {
      name: "Phone Max",
      imageUrl: "/products/phone-max.png",
      rentalPlans: {
        create: [
          { months: 1, priceCents: 1999 },
          { months: 3, priceCents: 5499 },
          { months: 6, priceCents: 9999 },
          { months: 12, priceCents: 17999 }
        ]
      }
    }
  });

  const camera = await prisma.product.create({
    data: {
      name: "Pro Camera",
      imageUrl: "/products/pro-camera.png",
      rentalPlans: {
        create: [
          { months: 1, priceCents: 2499 },
          { months: 3, priceCents: 6999 },
          { months: 6, priceCents: 12499 },
          { months: 12, priceCents: 22999 }
        ]
      }
    }
  });

  await prisma.subscription.create({
    data: {
      state: SubscriptionState.ACTIVE,
      rentalPeriodMonths: 3,
      activeUntil: addMonths(new Date(), 3),
      productId: phone.id
    }
  });

  await prisma.subscription.create({
    data: {
      state: SubscriptionState.PAUSED,
      rentalPeriodMonths: 6,
      activeUntil: addMonths(new Date(), 6),
      productId: camera.id
    }
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
