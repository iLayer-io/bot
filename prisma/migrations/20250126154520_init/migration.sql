-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('Created', 'Filled', 'Withdrawn');

-- CreateTable
CREATE TABLE "block_checkpoint" (
    "id" SERIAL NOT NULL,
    "chain_id" BIGINT NOT NULL,
    "processed_at" TIMESTAMP(2) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "height" BIGINT NOT NULL,

    CONSTRAINT "block_checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "chain_id" BIGINT NOT NULL,
    "order_id" BYTEA NOT NULL,
    "user" BYTEA NOT NULL,
    "filler" BYTEA NOT NULL,
    "source_chain_selector" BYTEA NOT NULL,
    "destination_chain_selector" BYTEA NOT NULL,
    "sponsored" BOOLEAN NOT NULL,
    "primary_filler_deadline" TIMESTAMP(2) NOT NULL,
    "deadline" TIMESTAMP(2) NOT NULL,
    "call_recipient" BYTEA,
    "call_data" BYTEA,
    "order_status" "order_status" NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_order_id_key" ON "order"("order_id");
