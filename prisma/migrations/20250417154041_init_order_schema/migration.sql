-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "options" TEXT NOT NULL,
    "permits" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderRequest" (
    "id" TEXT NOT NULL,
    "deadline" INTEGER NOT NULL,
    "nonce" INTEGER NOT NULL,

    CONSTRAINT "OrderRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetails" (
    "id" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "filler" TEXT NOT NULL,
    "sourceChainEid" INTEGER NOT NULL,
    "destinationChainEid" INTEGER NOT NULL,
    "sponsored" BOOLEAN NOT NULL,
    "primaryFillerDeadline" INTEGER NOT NULL,
    "deadline" INTEGER NOT NULL,
    "callRecipient" TEXT NOT NULL,
    "callData" TEXT NOT NULL,
    "callValue" INTEGER NOT NULL,
    "requestId" TEXT NOT NULL,

    CONSTRAINT "OrderDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "tokenType" INTEGER NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "orderInputId" TEXT,
    "orderOutputId" TEXT,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderId_key" ON "Order"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_requestId_key" ON "Order"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderDetails_requestId_key" ON "OrderDetails"("requestId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OrderRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetails" ADD CONSTRAINT "OrderDetails_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "OrderRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_orderInputId_fkey" FOREIGN KEY ("orderInputId") REFERENCES "OrderDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_orderOutputId_fkey" FOREIGN KEY ("orderOutputId") REFERENCES "OrderDetails"("id") ON DELETE SET NULL ON UPDATE CASCADE;
