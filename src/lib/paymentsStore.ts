import { PixPaymentResponse, PixCheckoutPayload } from "@/types/booking";

export interface StoredPayment {
  id: string;
  payload: PixCheckoutPayload;
  response: PixPaymentResponse;
  status: "pending" | "approved" | "rejected" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// In-memory store (for development and serverless demo)
// In production, this can be connected to Supabase, Prisma, or Redis.
const globalPayments = global as unknown as {
  __PAYMENTS_STORE__?: Map<string, StoredPayment>;
};

if (!globalPayments.__PAYMENTS_STORE__) {
  globalPayments.__PAYMENTS_STORE__ = new Map<string, StoredPayment>();
}

export const paymentsStore = globalPayments.__PAYMENTS_STORE__;

export function savePayment(stored: StoredPayment): void {
  paymentsStore.set(stored.id, stored);
}

export function getPayment(id: string): StoredPayment | undefined {
  return paymentsStore.get(id);
}

export function updatePaymentStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "cancelled"
): StoredPayment | null {
  const payment = paymentsStore.get(id);
  if (!payment) return null;

  payment.status = status;
  payment.response.status = status;
  payment.response.statusDetail =
    status === "approved"
      ? "accredited"
      : status === "rejected"
      ? "cc_rejected_other_reason"
      : "pending_waiting_transfer";
  payment.updatedAt = new Date().toISOString();

  paymentsStore.set(id, payment);
  return payment;
}
