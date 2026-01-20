import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

const MAX_LIMIT = 50;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  type SubscriptionOrderKey =
    | "activeUntil"
    | "product.title";

  const orderByMap: Record<
    SubscriptionOrderKey,
    Parameters<typeof prisma.subscription.findMany>[0]["orderBy"]
  > = {
    activeUntil: { activeUntil: "asc" },
    "product.title": {
      product: {
        title: "asc",
      },
    },
  };

  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit ?? 10)));
  const skip = (page - 1) * limit;

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      include: {
        product: {
          include: {
            rentalPlans: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: orderByMap["activeUntil"]
    }),
    prisma.subscription.count()
  ])


  return res.status(200).json({
    items: subscriptions,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
}
