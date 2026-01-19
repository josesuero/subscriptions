import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const subscriptions = await prisma.subscription.findMany({
    include: {
      product: {
        include: {
          rentalPlans: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return res.status(200).json({ subscriptions });
}
