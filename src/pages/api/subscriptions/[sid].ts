import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { addMonths } from "date-fns";

type PatchBody = {
  newRentalPeriod?: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const sid = Array.isArray(req.query.sid) ? req.query.sid[0] : req.query.sid;

  if (!sid) {
    return res.status(400).json({ message: "Invalid subscription id" });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { id: sid },
    include: {
      product: {
        include: { rentalPlans: true }
      }
    }
  });

  if (!subscription) {
    return res.status(404).json({ message: "Subscription not found" });
  }

  if (req.method === "GET") {
    return res.status(200).json({ subscription });
  }

  if (req.method === "PATCH") {
    if (!req.body){
      return res.status(400).json({ message: "Body can not be empty" });
    }
    const body = typeof req.body === "string" && req.body ? (JSON.parse(req.body) as PatchBody) : (req.body as PatchBody);
    const newRentalPeriod = Number(body?.newRentalPeriod);
    
    if (subscription.state !== "ACTIVE") {
      return res.status(400).json({ message: "only ACTIVE subscriptions can be extended" });
    }
    if (!Number.isFinite(newRentalPeriod)) {
      return res.status(400).json({ message: "newRentalPeriod must be a number" });
    }

    if (newRentalPeriod <= subscription.rentalPeriod) {
      return res.status(400).json({ message: `new rental period must be greater than current rental period (${subscription.rentalPeriod} Months)` });
    }


    const matchingPlan = subscription.product.rentalPlans.find(
      (plan) => plan.period === newRentalPeriod
    );

    if (!matchingPlan) {
      return res.status(400).json({ message: "no rental plan found for the requested rental period" });
    }

    

    // TODO: Implement extension logic.
    // Business rules to implement:
    // - Only ACTIVE subscriptions can be extended.
    // - newRentalPeriod must be greater than the current rentalPeriod.
    // - newRentalPeriod must exist in the product rentalPlans.
    // - activeUntil must be extended using date-fns (addMonths).

    const updatedSubscription = await prisma.subscription.update({
      where: { id: sid },
      data: {
        rentalPeriod: newRentalPeriod,
        activeUntil: addMonths(subscription.activeUntil, newRentalPeriod)
      }
    });

    return res.status(200).json({ subscription: updatedSubscription });
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ message: "Method Not Allowed" });
}
