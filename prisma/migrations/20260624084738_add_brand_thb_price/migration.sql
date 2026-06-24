-- Rename jpyPrice to thbPrice (preserving existing data, now represents THB selling price)
ALTER TABLE "products" RENAME COLUMN "jpyPrice" TO "thbPrice";

-- Add new columns
ALTER TABLE "products" ADD COLUMN "brand" TEXT;
ALTER TABLE "products" ADD COLUMN "otherShopPrice" DECIMAL(10,2);
