-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "coreAttribute" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RentalPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "period" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "RentalPlan_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referenceId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "activatedAt" DATETIME,
    "activeUntil" DATETIME NOT NULL,
    "terminatedAt" DATETIME,
    "terminationReason" TEXT,
    "terminationComment" TEXT,
    "rentalPeriod" INTEGER NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "state" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    CONSTRAINT "Subscription_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RentalPlan_productId_period_key" ON "RentalPlan"("productId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_referenceId_key" ON "Subscription"("referenceId");
