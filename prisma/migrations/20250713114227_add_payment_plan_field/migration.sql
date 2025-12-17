-- AlterTable
ALTER TABLE "PaymentStatus" ADD COLUMN     "paymentPlan" TEXT;

-- AlterTable
ALTER TABLE "PaystackTransaction" ADD COLUMN     "paymentPlan" TEXT;
