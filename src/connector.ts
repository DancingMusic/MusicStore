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
  | "login"
  | "user-library"
  | "recommendations";

export type MusicConnectorLoginStatus =
  | "unsupported"
  | "anonymous"
  | "pending"
  | "authenticated"
  | "expired"
  | "error";

export type MusicConnectorLoginIntent = "status" | "start" | "continue" | "cancel" | "logout";
export type MusicConnectorLoginFlow = "qr" | "oauth" | "browser" | "device-code" | "manual-token" | "custom";
export type MusicConnectorLoginActionType = "qr" | "open-url" | "manual-input" | "message";
export type MusicConnectorLoginCookieProvider = "netease" | "qq-music" | "apple-music" | "custom" | string;

export interface MusicConnectorLoginRequest {
  /** What the host is asking the connector to do. Defaults to `status`. */
  intent?: MusicConnectorLoginIntent;
  /** Connector-scoped flow id returned by a previous login() call. */
  flowId?: string;
  /** Optional host-provided values for manual-input/custom/browser cookie flows. */
  input?: Record<string, unknown>;
}

export interface MusicConnectorLoginCookieCapture {
  /**
   * Provider hint for hosts with a native implementation. The host may use it
   * to open the original provider page in an isolated desktop session and
   * return a cookie string through login({ intent: "continue", input }).
   */
  provider?: MusicConnectorLoginCookieProvider;
  /** Optional override for the browser URL. Defaults to the action's url. */
  url?: string;
  /** Optional title for a native login window. */
  title?: string;
  /** Stable storage partition for desktop sessions. Hosts may ignore this. */
  partition?: string;
  /** Allowed cookie domains to include in the returned Cookie header. */
  domains?: string[];
  /** Cookie names that indicate the login has completed. */
  requiredCookieNames?: string[];
  /** Cookie names that indicate playback-capable login for platforms that need it. */
  playbackCookieNames?: string[];
  /** Cookie priority/order when constructing a Cookie header. */
  cookieNames?: string[];
  /** Optional URL to visit after login so providers can mint playback cookies. */
  warmupUrl?: string;
  /** Host-facing explanation for this capture flow. */
  message?: string;
}

export interface MusicConnectorLoginAction {
  type: MusicConnectorLoginActionType;
  label?: string;
  /** QR payload or URL. Hosts may render this as a QR if no imageUrl exists. */
  qrUrl?: string;
  /** Ready-to-display QR image URL, including data:image/* URLs. */
  imageUrl?: string;
  /** Login URL for OAuth, device-code, or manual token generation. Hosts should embed it in-app when possible. */
  url?: string;
  /** Optional hint for desktop hosts to capture official web-session cookies in-app. */
  cookieCapture?: MusicConnectorLoginCookieCapture;
  /** Manual fields requested from the user by this connector. */
  fields?: ConnectorConfigField[];
  message?: string;
}

export interface MusicConnectorLoginResult {
  status: MusicConnectorLoginStatus;
  flow?: MusicConnectorLoginFlow;
  /** Connector-scoped flow id for follow-up login({ intent: "continue" }). */
  flowId?: string;
  actions?: MusicConnectorLoginAction[];
  user?: {
    id?: string;
    name?: string;
    avatarUrl?: string;
  };
  message?: string;
  expiresAt?: number;
  nextPollMs?: number;
  /**
   * Config updates that should be persisted by the host after a successful
   * login. This keeps provider cookies/tokens inside connector-owned config
   * instead of adding provider-specific fields to the host.
   */
  configPatch?: Record<string, unknown>;
}

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
   * Optional login hook. Declare `login` in `meta.capabilities` when
   * implemented. Platforms can use QR, OAuth, browser, device-code, manual
   * token, or custom flows; the host only renders returned actions and sends
   * follow-up requests back through login().
   */
  login?(request?: MusicConnectorLoginRequest): Promise<MusicConnectorLoginResult>;

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
