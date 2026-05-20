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

/** A curated/featured playlist surfaced by the data source. */
export interface MusicPlaylist {
  /** Prefixed id (e.g. `netease-playlist:12345`, `spotify-playlist:37i9...`). */
  id: string;
  name: string;
  description?: string;
  /** Cover image URL (display as link or thumb at host's discretion). */
  coverUrl?: string;
  /** Approximate track count if the upstream API provides it. */
  trackCount?: number;
  /** Who curated this playlist (platform editor, user, or "Editor's Picks"). */
  curator?: string;
  /** External link back to the playlist on the original platform. */
  externalUrl?: string;
}

export interface MusicPlaylistList {
  playlists: MusicPlaylist[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MusicPlaylistQuery {
  /** Per-connector category id (e.g. NetEase tag, Spotify category, "top"). */
  category?: string;
  page?: number;
  pageSize?: number;
  /**
   * Sort order. Connectors that can't honor a given order should pick the
   * closest fit and document it in their README. Supported values:
   *  - `hot`  (default) — most-played / most-listened / most-downloaded
   *  - `new`            — most-recently-created / latest
   *  - `trending`       — short-term momentum (last few days). Falls back
   *                       to `hot` when upstream has no such concept.
   */
  sort?: "hot" | "new" | "trending";
}

export interface MusicConnector {
  readonly meta: MusicConnectorMeta;

  init?(config?: Record<string, unknown>): Promise<void>;
  dispose?(): void;

  search(query: MusicListQuery): Promise<MusicSearchResult>;
  getTrack(trackId: string): Promise<MusicTrack | null>;
  getStreamUrl(trackId: string): Promise<MusicStreamInfo | null>;
  getLyrics?(trackId: string): Promise<MusicLyrics | null>;

  /**
   * List curated / featured / popular playlists from the data source.
   * Optional — declare `playlist` in `meta.capabilities` to advertise support.
   */
  listPlaylists?(query?: MusicPlaylistQuery): Promise<MusicPlaylistList>;

  /**
   * Fetch the full track list for a given playlist id.
   * Reuses MusicSearchResult shape (tracks + pagination).
   */
  getPlaylistTracks?(
    playlistId: string,
    opts?: { page?: number; pageSize?: number },
  ): Promise<MusicSearchResult>;
}
