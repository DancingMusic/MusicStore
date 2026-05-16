import type { MusicListQuery, MusicOrder, MusicStoreClientOptions, MusicTrack } from "./types";

export class MusicStoreClient {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(options: MusicStoreClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
  }

  async list(_query: MusicListQuery = {}): Promise<MusicTrack[]> {
    return [];
  }

  async get(trackId: string): Promise<MusicTrack | null> {
    if (!trackId) {
      throw new Error("trackId is required");
    }
    return null;
  }

  async createOrder(trackId: string): Promise<MusicOrder> {
    if (!trackId) {
      throw new Error("trackId is required");
    }
    return {
      orderId: "",
      trackId,
      amount: 0,
      currency: "USD",
      status: "pending"
    };
  }

  async verifyOrder(orderId: string): Promise<MusicOrder | null> {
    if (!orderId) {
      throw new Error("orderId is required");
    }
    return null;
  }

  get config() {
    return {
      baseUrl: this.baseUrl,
      hasToken: Boolean(this.token)
    };
  }
}
