export interface MusicListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  genre?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  durationSec: number;
  price: number;
  currency: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface MusicOrder {
  orderId: string;
  trackId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded";
}

export interface MusicStoreClientOptions {
  baseUrl: string;
  token?: string;
  timeoutMs?: number;
}
