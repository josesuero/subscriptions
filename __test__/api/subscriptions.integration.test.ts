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
      slug: "test-gadget",
      title: "Test Gadget",
      coreAttribute: "Test core attribute",
      image: "/products/test.png",
      rentalPlans: {
        create: [
          { period: 1, price: 1000 },
          { period: 3, price: 2500 },
          { period: 6, price: 4500 }
        ]
      }
    }
  });

  const subscription = await prisma.subscription.create({
    data: {
      state: "ACTIVE",
      referenceId: "G-TEST-3M",
      rentalPeriod: 3,
      monthlyPrice: 2500,
      activatedAt: new Date("2025-01-15T00:00:00.000Z"),
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
      body: { newRentalPeriod: 6 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const payload = res._getJSONData();
    expect(payload.subscription.rentalPeriod).toBe(6);
    expect(payload.subscription.activeUntil).toBe(addMonths(new Date("2025-01-15T00:00:00.000Z"), 6).toISOString());
  });

  it("rejects extensions that do not increase the rental period", async () => {
    const subscription = await prisma.subscription.findFirstOrThrow();

    const { req, res } = createMocks({
      method: "PATCH",
      query: { sid: String(subscription.id) },
      body: { newRentalPeriod: 3 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/must be greater/i);
  });
});
