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

export interface ConnectorConfigField {
  /** Key under which the value is stored in the config object passed to init(). */
  key: string;
  /** Human-readable label shown in the form. */
  label: string;
  /** Input type hint. password masks the value; url validates URL shape. */
  type?: "text" | "url" | "password";
  /** When true, the host blocks registration until the user provides a value. */
  required?: boolean;
  /** Placeholder shown inside the input. */
  placeholder?: string;
  /** Default value pre-filled into the input. */
  default?: string;
  /** Short explanatory hint shown beneath the input. */
  help?: string;
}

export interface MusicConnectorMeta {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  version: string;
  capabilities: MusicConnectorCapability[];
  /**
   * Declarative schema of the config object the connector accepts via
   * `init(config)`. The host renders these as form fields when adding
   * or editing the connector. Omit when no config is needed.
   */
  configSchema?: ConnectorConfigField[];
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
