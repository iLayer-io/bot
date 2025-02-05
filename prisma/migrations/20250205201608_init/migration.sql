/*
  Warnings:

  - Changed the type of `source_chain_selector` on the `order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `destination_chain_selector` on the `order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "order" DROP COLUMN "source_chain_selector",
ADD COLUMN     "source_chain_selector" BIGINT NOT NULL,
DROP COLUMN "destination_chain_selector",
ADD COLUMN     "destination_chain_selector" BIGINT NOT NULL;
