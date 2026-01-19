import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

type PatchBody = {
  newRentalPeriodMonths?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sid = Array.isArray(req.query.sid) ? req.query.sid[0] : req.query.sid;
  const subscriptionId = Number(sid);

  if (!sid || Number.isNaN(subscriptionId)) {
    return res.status(400).json({ message: "Invalid subscription id" });
  }

  if (req.method === "GET") {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        product: {
          include: { rentalPlans: true }
        }
      }
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json({ subscription });
  }

  if (req.method === "PATCH") {
    const body = typeof req.body === "string" ? (JSON.parse(req.body) as PatchBody) : (req.body as PatchBody);
    const newRentalPeriodMonths = Number(body?.newRentalPeriodMonths);

    if (!Number.isFinite(newRentalPeriodMonths)) {
      return res.status(400).json({ message: "newRentalPeriodMonths must be a number" });
    }

    // TODO: Implement extension logic.
    // Business rules to implement:
    // - Only ACTIVE subscriptions can be extended.
    // - newRentalPeriodMonths must be greater than the current rentalPeriodMonths.
    // - newRentalPeriodMonths must exist in the product rentalPlans.
    // - activeUntil must be extended using date-fns (addMonths).

    return res.status(501).json({ message: "Not Implemented" });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ message: "Method Not Allowed" });
}
