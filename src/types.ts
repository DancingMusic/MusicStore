export type { MusicListQuery, MusicTrack } from "@dancingmusic/music-connect";

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
