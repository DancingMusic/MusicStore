# OpenSpec: MusicStoreSdk

- Spec-ID: `music-store-sdk-openspec`
- Version: `2.0.0`
- Status: `Active`
- Last-Updated: `2026-05-17`

## Scope

定义音乐商店 SDK 的边界、API 表面、数据模型和发布策略。

## 当前状态

- 包名：`@dancingmusic/music-store-sdk`
- 版本：`v0.1.0`
- 核心导出：`MusicTrack`、`MusicOrder`、`MusicLicense`（类型）、`MusicStoreClient`（API 客户端）
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
