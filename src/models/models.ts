import { Subscription } from "@prisma/client";

export const enum SubscriptionState {
    DRAFT = "DRAFT",
    FULFILLING = "FULFILLING",
    ACTIVE = "ACTIVE",
    TERMINATED = "TERMINATED"
}


export type SubscrpitionPages = {
    items: Subscription[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};
