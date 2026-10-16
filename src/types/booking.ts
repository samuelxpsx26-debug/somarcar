export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  durationLabel: string;
  price: number;
  badge?: string;
  category?: string;
}

export interface BookingState {
  service: Service | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  depositAmount: number;
  slug?: string;
}

export type BookingStep = 1 | 2 | 3 | 4;

export interface BusinessProfile {
  name: string;
  slug: string;
  tagline: string;
  avatarUrl: string;
  coverGradient: string;
  category: string;
  rating: number;
  reviewsCount: number;
  address: string;
  instagramHandle: string;
  pixKey: string;
}

export interface PixCheckoutPayload {
  service: Service;
  depositAmount: number;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  date: string;
  time: string;
  slug?: string;
}

export interface PixPaymentResponse {
  id: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  statusDetail: string;
  qrCode: string; // Código Pix Copia e Cola
  qrCodeBase64: string; // Imagem em base64
  ticketUrl?: string;
  expiresAt: string;
  depositAmount: number;
  bookingRef: string;
}

export interface PixWebhookPayload {
  id?: number | string;
  live_mode?: boolean;
  type?: string;
  date_created?: string;
  user_id?: number | string;
  api_version?: string;
  action?: string;
  data?: {
    id: string;
  };
}
