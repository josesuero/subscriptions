# Grover Subscription Extension Interview Starter

This is a **starter** project for a live coding interview. The app runs, the UI renders, and the API routes exist, but the key business logic is intentionally **incomplete**.

## What works
- Next.js pages router app renders a subscription list.
- `GET /api/subscriptions` and `GET /api/subscriptions/[sid]` return data.
- Prisma schema + seed script create products, rental plans, and subscriptions.

## What is intentionally incomplete
- `PATCH /api/subscriptions/[sid]` returns `501 Not Implemented`.
- Subscription extension business rules are **described in comments only**.
- The Extend button only shows a TODO alert.
- Vitest tests for subscription extension **fail** by design.

## Candidate task
Implement subscription extension logic end-to-end:
1. Update the API route to enforce business rules and persist changes.
2. Wire the frontend Extend button to call the PATCH endpoint.
3. Make the failing tests pass (and add any missing tests if needed).

## Business rules (to implement)
- Only `ACTIVE` subscriptions can be extended.
- `newRentalPeriodMonths` must be greater than the current rental period.
- `newRentalPeriodMonths` must exist in the product rental plans.
- `activeUntil` must be extended using `date-fns` `addMonths`.

## Getting started
```bash
npm install
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
npm run dev
```

## Tests
```bash
npm run test
```

The tests will fail until the PATCH logic is implemented.
