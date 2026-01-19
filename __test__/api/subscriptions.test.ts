import { addMonths } from "date-fns";
import { createMocks } from "node-mocks-http";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import handler from "../../src/pages/api/subscriptions/[sid]";
import { prisma } from "../../src/lib/prisma";

async function seedSubscription() {
  await prisma.subscription.deleteMany();
  await prisma.rentalPlan.deleteMany();
  await prisma.product.deleteMany();

  const product = await prisma.product.create({
    data: {
      name: "Test Gadget",
      imageUrl: "/products/test.png",
      rentalPlans: {
        create: [
          { months: 1, priceCents: 1000 },
          { months: 3, priceCents: 2500 },
          { months: 6, priceCents: 4500 }
        ]
      }
    }
  });

  const subscription = await prisma.subscription.create({
    data: {
      state: "ACTIVE",
      rentalPeriodMonths: 3,
      activeUntil: new Date("2025-01-15T00:00:00.000Z"),
      productId: product.id
    }
  });

  return subscription;
}

describe("PATCH /api/subscriptions/[sid]", () => {
  beforeEach(async () => {
    await seedSubscription();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("extends an active subscription to a longer rental period", async () => {
    const subscription = await prisma.subscription.findFirstOrThrow();

    const { req, res } = createMocks({
      method: "PATCH",
      query: { sid: String(subscription.id) },
      body: { newRentalPeriodMonths: 6 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const payload = res._getJSONData();
    expect(payload.subscription.rentalPeriodMonths).toBe(6);
    expect(payload.subscription.activeUntil).toBe(addMonths(new Date("2025-01-15T00:00:00.000Z"), 6).toISOString());
  });

  it("rejects extensions that do not increase the rental period", async () => {
    const subscription = await prisma.subscription.findFirstOrThrow();

    const { req, res } = createMocks({
      method: "PATCH",
      query: { sid: String(subscription.id) },
      body: { newRentalPeriodMonths: 3 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/must be greater/i);
  });
});
