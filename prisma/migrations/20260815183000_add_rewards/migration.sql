CREATE TABLE "RewardItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RewardItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RewardPurchase" (
    "id" TEXT NOT NULL,
    "rewardItemId" TEXT NOT NULL,
    "pricePaid" INTEGER NOT NULL,
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RewardPurchase_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RewardPurchase_rewardItemId_idx" ON "RewardPurchase"("rewardItemId");

ALTER TABLE "RewardPurchase" ADD CONSTRAINT "RewardPurchase_rewardItemId_fkey"
FOREIGN KEY ("rewardItemId") REFERENCES "RewardItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
