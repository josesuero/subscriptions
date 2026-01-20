import { addMonths } from "date-fns";
import { createMocks } from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Subscription } from "../../src/components/SubscriptionCard";
import type { RentalPlan } from "../../src/components/SubscriptionCard";
import type { Product, PrismaClient } from "../../src/generated/prisma";
import handler from "../../src/pages/api/subscriptions/[sid]";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    subscription: {
      findUnique: vi.fn(),
      update: vi.fn()
    }
  }
}));

import { prisma } from "../../src/lib/prisma";

const baseProduct: Product & { rentalPlans: RentalPlan[] } = {
  id: "prod_1",
  slug: "test-gadget",
  title: "Test Gadget",
  coreAttribute: "Test core attribute",
  image: "/products/test.png",
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  rentalPlans: [
    { id: "plan_1", period: 1, price: 1000, productId: "prod_1" },
    { id: "plan_3", period: 3, price: 2500, productId: "prod_1" },
    { id: "plan_6", period: 6, price: 4500, productId: "prod_1" }
  ]
};

const baseSubscription: Subscription = {
  id: "sub_1",
  referenceId: "G-TEST-3M",
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  activatedAt: "2025-01-15T00:00:00.000Z",
  activeUntil: "2025-01-15T00:00:00.000Z",
  terminatedAt: null,
  terminationReason: null,
  terminationComment: null,
  rentalPeriod: 3,
  monthlyPrice: 2500,
  state: "ACTIVE",
  productId: "prod_1",
  product: baseProduct
};

describe("PATCH /api/subscriptions/[sid]", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const prismaClient = prisma as unknown as PrismaClient;
    vi.mocked(prismaClient.subscription.findUnique).mockResolvedValue({
      ...baseSubscription,
      activatedAt: new Date(baseSubscription.activatedAt || ""),
      activeUntil: new Date(baseSubscription.activeUntil),
      createdAt: new Date(baseSubscription.createdAt),
      updatedAt: new Date(baseSubscription.updatedAt),
      product: baseProduct
    });

    vi.mocked(prismaClient.subscription.update).mockImplementation(async ({ data }) => {
      return {
        ...baseSubscription,
        rentalPeriod: Number(data.rentalPeriod),
        activeUntil: addMonths(
          new Date(baseSubscription.activeUntil),
          Number(data.rentalPeriod)
        ).toISOString()
      } as unknown as PrismaClient["subscription"] extends {
        update: (...args: any) => Promise<infer R>;
      }
        ? R
        : never;
    });
  });

  it("extends an active subscription to a longer rental period", async () => {
    const { req, res } = createMocks({
      method: "PATCH",
      query: { sid: baseSubscription.id },
      body: { newRentalPeriod: 6 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);

    const payload = res._getJSONData();
    expect(payload.subscription.rentalPeriod).toBe(6);
    expect(payload.subscription.activeUntil).toBe(
      addMonths(new Date("2025-01-15T00:00:00.000Z"), 6).toISOString()
    );
  });

  it("rejects extensions that do not increase the rental period", async () => {
    const { req, res } = createMocks({
      method: "PATCH",
      query: { sid: baseSubscription.id },
      body: { newRentalPeriod: 3 }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getJSONData().message).toMatch(/must be greater/i);
  });
});
