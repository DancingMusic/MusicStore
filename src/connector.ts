import type { MusicListQuery, MusicTrack } from "./types";

export interface MusicSearchResult {
  tracks: MusicTrack[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MusicStreamInfo {
  url: string;
  format: string;
  bitrate?: number;
  expiresAt?: number;
}

export interface MusicLyrics {
  text: string;
  translated?: string;
  timeline?: LyricLine[];
}

export interface LyricLine {
  time: number;
  text: string;
  translated?: string;
}

export interface MusicConnectorMeta {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  version: string;
  capabilities: MusicConnectorCapability[];
}

export type MusicConnectorCapability =
  | "search"
  | "stream"
  | "lyrics"
  | "playlist"
  | "user-library"
  | "recommendations";

export interface MusicConnector {
  readonly meta: MusicConnectorMeta;

  init?(config?: Record<string, unknown>): Promise<void>;
  dispose?(): void;

  search(query: MusicListQuery): Promise<MusicSearchResult>;
  getTrack(trackId: string): Promise<MusicTrack | null>;
  getStreamUrl(trackId: string): Promise<MusicStreamInfo | null>;
  getLyrics?(trackId: string): Promise<MusicLyrics | null>;
}
