# OpenSpec: MusicStoreSdk

- Spec-ID: `music-store-sdk-openspec`
- Version: `2.1.0`
- Status: `Active`
- Last-Updated: `2026-06-28`

## Scope

定义音乐商店 SDK 的边界、API 表面、数据模型和发布策略。

## 当前状态

- 包名：`@dancingmusic/music-store`
- 版本：`v0.3.0`
- 核心导出：`MusicTrack`、`MusicOrder`、`MusicLicense`（类型）、`MusicStoreClient`（API 客户端）、`MusicConnector` / `MusicConnectorRegistry`（动态音乐连接器接口）
- 文档站：`docs/index.html`（支持 i18n 中英切换、客户端搜索、暗色模式）

## 核心数据模型

### MusicTrack（音乐曲目）

- `id` — 唯一标识
- `title` — 曲目名称
- `artist` — 艺术家
- `album` — 专辑
- `genre` — 流派
- `duration` — 时长
- `price` — 价格
- `previewUrl` — 试听地址
- `downloadUrl` — 下载地址

### MusicOrder（订单）

- `orderId` — 订单 ID
- `trackId` — 曲目 ID
- `userId` — 用户 ID
- `status` — 订单状态
- `createdAt` — 创建时间

### MusicLicense（授权）

- `licenseId` — 授权 ID
- `trackId` — 曲目 ID
- `userId` — 用户 ID
- `type` — 授权类型（个人/商用）
- `expiresAt` — 过期时间

## API 客户端（MusicStoreClient）

计划接口：
- `list(params?)` — 曲目列表（支持流派筛选）
- `get(id)` — 曲目详情
- `createOrder(trackId)` — 创建订单
- `verifyOrder(orderId)` — 验证订单
- `getLicense(trackId)` — 获取授权

## 动态连接器接口（MusicConnector）

核心能力：
- `search(query)` — 搜索音乐。
- `getTrack(trackId)` — 获取曲目详情。
- `getStreamUrl(trackId)` — 获取真实可播放 URL。
- `getLyrics(trackId)` — 可选歌词能力。
- `listPlaylists(query)` / `getPlaylistTracks(id)` — 可选歌单能力。

登录能力（v0.3.0）：
- 声明 `login` capability 后，可选实现单一 `login(request)` 接口。
- `login(request)` 可返回 `qr` / `oauth` / `browser` / `device-code` / `manual-token` / `custom` 流程动作。
- 宿主渲染 `open-url` action 时优先使用应用内弹窗 / iframe，避免用户离开音乐播放器界面；外部浏览器仅作嵌入失败时的兜底。
- 登录结果返回的 `configPatch` 由宿主持久化进连接器自己的 config，SDK/宿主不得定义平台专用凭证字段。

## MUST

- 独立可构建：`npm run build` 无需宿主环境。
- 公开 API 在 SemVer 下保持稳定。
- 仅通过 `src/index.ts` 对外导出。
- 维护文档站 `docs/index.html`。

## MUST NOT

- 依赖 `DancingStoreSdk` 或 `DancingPluginSdk` 内部模块。
- 包含宿主应用 UI / 运行时代码。

## Release

1. 更新 changelog / README。
2. Run `npm run typecheck && npm run build`。
3. 更新 `docs/index.html` 中的版本号。
4. 发布版本标签和包。
