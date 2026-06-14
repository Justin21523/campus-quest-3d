# 專案架構與核心邏輯摘要

> Campus Quest 3D — 全端 3D 校園城市探索 RPG。本文件供 AI / 開發者快速理解專案現況並接續開發。
> 產生時間基準：分支 `feat/gameplay-foundation`（已含 Batch 1–8）。

---

## 1. 技術棧

### 程式語言與版本
- **TypeScript** `~5.7.3`（前端、API、共用套件，全專案 `"type": "module"` ESM）
- **Python** `3.x`（AI 服務，FastAPI）
- Monorepo：**npm workspaces**（`apps/web`、`apps/api`、`packages/shared-types`、`packages/game-data`；`apps/ai-service` 為獨立 Python 專案，不在 npm workspace 內）

### 前端（apps/web）
- **React 19** + **react-dom 19**
- **Three.js** + **@react-three/fiber 9**（R3F）+ **@react-three/drei**（Text、Sky、Stats、PerspectiveCamera 等）
- **@react-three/rapier 2** + **@dimforge/rapier3d-compat**（物理：KinematicCharacterController、射線、剛體）
- **Zustand 5**（狀態管理，部分搭配 `persist` middleware 存 localStorage）
- **Phaser 3**（2D mini-game 疊層）
- **Tailwind CSS 4**（UI overlay）、**lucide-react**（圖示）、**clsx**
- **Vite 8**（建置；輸出多個 vendor chunk）、**axios**（API 客戶端）

### 後端 API（apps/api）
- **Node.js + Express 4**
- **Mongoose 8** / **MongoDB**（玩家持久化）
- 相依：`cors`、`dotenv`、`zod`、`bcryptjs`、`jsonwebtoken`（後二者已安裝但尚未使用）
- 開發用 `tsx watch`，建置用 `tsc`

### AI 服務（apps/ai-service）
- **FastAPI 0.136** + **uvicorn** + **pydantic 2**
- 目前全為 **mock 實作**（尚未接 LLM）

### 資料庫
- **MongoDB**（單一 `Player` collection；連線字串預設 `mongodb://localhost:27017/campus_quest`）
- 大量遊戲狀態改用瀏覽器 **localStorage**（Zustand persist，key 前綴 `cq-`）

---

## 2. 資料夾結構

```
campus-quest-3d/
├── package.json                      # workspace root；dev 用 concurrently 同時啟動 web/api/ai
├── scripts/check-health.mjs          # 探測 web/api/ai 三服務健康（注意：埠號與實際設定不符）
├── docker/  docs/                    # 部署設定 / 文件
│
├── packages/
│   ├── shared-types/                 # 前後端共用 TS 型別（純型別，無執行邏輯）
│   │   └── src/
│   │       ├── index.ts              # 匯總匯出 + API 包裝型別、CampusZoneId、QuestStatus、NPCMood
│   │       └── types/{common,health,player}.ts  # Vector3 / HealthCheckResponse / PlayerState
│   │
│   └── game-data/                    # 共用「資料」套件（tsc 編譯成 dist；web/api 以 file: 依賴）
│       └── src/
│           ├── index.ts              # 套件出入口（re-export maps/quests/items/npcs）
│           ├── items.ts              # 物品定義表 ITEM_DEFINITIONS + 查詢
│           ├── npcs.ts               # NPC 定義表 + 日phase行程 + getNpcsAt
│           ├── quests.ts             # 任務定義表 QUEST_DEFINITIONS
│           └── maps/{types,room-templates,campus-zones,zone-connections}.ts  # ⚠ 舊版地圖資料，web 未使用（見備註）
│
├── apps/
│   ├── ai-service/                   # Python FastAPI（mock）
│   │   ├── requirements.txt
│   │   └── app/
│   │       ├── main.py               # FastAPI 入口（自帶 mock /health 與 dialogue 端點）
│   │       ├── api/{health,dialogue,events,hints}.py  # ⚠ APIRouter 們，但未被 main.py 掛載
│   │       └── schemas/dialogue.py   # pydantic 模型（⚠ 含 `from typing import list` 錯誤 import）
│   │
│   ├── api/                          # Node/Express + Mongoose
│   │   └── src/
│   │       ├── server.ts             # 啟動入口（listen；⚠ 未呼叫 connectDB）
│   │       ├── app.ts                # Express app + 路由掛載
│   │       ├── index.ts              # 空 re-export（相容用）
│   │       ├── config/db.ts          # connectDB()（Mongoose 連線）
│   │       ├── models/Player.model.ts# Mongoose Player schema/model
│   │       ├── models/player.ts      # ⚠ 重複/誤置的舊版 router（未掛載）
│   │       └── routes/{health,ai,player}.ts  # 健康檢查 / AI 代理 / 玩家 CRUD
│   │
│   └── web/                          # 主前端（React + R3F）
│       ├── index.html  main.tsx      # 入口
│       ├── App.tsx                   # 根組件：掛載 Scene3D + 所有 UI overlay + 全域鍵盤
│       ├── vite.config.ts            # Vite 設定（/api proxy、vendor 分包）
│       └── src/
│           ├── components/           # React + R3F 組件（見下）
│           │   ├── architecture/     # 建築渲染（Building/Room/Wall/Stairs/Slab/Furniture/SchoolExterior/CampusMap/ZonePortal/OutdoorProps）
│           │   └── world/            # 串流世界物件（Chunk/ChunkManager/TownBuilding/Vehicle/Pedestrian/TrafficProps/BusStop/Event*/Npc/InteriorExitPortal）
│           ├── store/                # Zustand stores（見下）
│           ├── world/                # 純邏輯（無 R3F）：地圖生成、移動、獎勵、交通、出生
│           ├── data/                 # 地圖/物品/事件資料與生成器
│           │   ├── maps/             # ★ web 實際使用的地圖系統（與 game-data/maps 不同）
│           │   ├── events.ts         # 隨機事件定義（web-local）
│           │   └── quests.ts         # re-export game-data 任務
│           ├── hooks/                # useInteraction / useZoneTransition / useFastTravel / useEnterBuilding / useThrottle
│           ├── phaser/scenes/        # LibrarySortScene（拖曳分類 mini-game）
│           ├── services/api.ts       # axios 封裝（health/player）
│           └── index.css App.css     # 樣式 + slide-in 動畫
```

> **重要備註（資料重複）**：`packages/game-data/src/maps/*` 是早期的地圖型別/資料，**web 前端並未使用**；web 改用功能更完整的 `apps/web/src/data/maps/*`（程序化建築生成器）。web 只從 game-data 取用 **items / npcs / quests** 與少數型別。修改地圖請改 `apps/web/src/data/maps/`。

---

## 3. 各程式碼檔案說明

### 3.1 packages/shared-types（純型別）

- **src/types/common.ts** — `Vector3`、`ServiceStatus`、`HealthDependencies`。
- **src/types/health.ts** — `HealthCheckResponse`（service/status/timestamp/version/deps）。
- **src/types/player.ts** — `PlayerState`、`PlayerInitRequest`、`PlayerUpdateRequest`。
- **src/index.ts** — 匯總上述型別 + `ApiErrorResponse/ApiSuccessResponse`、`CampusZoneId`、`QuestStatus`、`NPCMood`。

### 3.2 packages/game-data（共用資料；改 src 後須 `npm run build` 重編 dist）

- **src/items.ts** — 用途：物品總表。`ITEM_DEFINITIONS`（key/keycard/consumable/material/gift/collectible…），`getItemById`、`getItemsByType`、`COLLECTIBLE_ITEM_IDS`（hidden 物品 id）。
- **src/npcs.ts** — 用途：資料驅動 NPC。`NpcDefinition`（homeZone、`schedule: Record<DayPhase,{zone,position}>`、dialogue、favoriteItems），`DAY_PHASES=['morning','afternoon','evening']`，`getNpcsAt(zone,phase)`。現有 NPC：alice/bob/mei/sato + **hana（Riverside）/kenji（Northhill）**。
- **src/quests.ts** — 用途：任務總表。`QuestDefinition`（objectives、npcId、zoneId、miniGameId、rewardItemIds），含 `q_library_sort` 與 **`q_cross_school_exchange`（跨校任務）**。
- **src/maps/*** — ⚠ 舊版地圖資料（web 未使用）。
- **src/index.ts** — 套件公開出入口。
- 依賴：無外部執行期依賴（純資料 + 函式）。

### 3.3 apps/ai-service（Python，mock）

- **app/main.py** — FastAPI app；自帶 `GET /health`、`POST /ai/v1/dialogue/generate`（mock 回覆）。**待辦**：接真實 LLM；目前未掛載 `api/` 下的 router。
- **app/api/health.py / dialogue.py / events.py / hints.py** — 各自 `APIRouter`（健康、NPC 對話、每日事件、分級任務提示），皆 mock。**⚠ 未被 main.py `include_router`，目前不會生效。**
- **app/schemas/dialogue.py** — pydantic `DialogueRequest/Response`。**⚠ `from typing import list` 為無效 import（執行會報錯）。**

### 3.4 apps/api（Express + Mongoose）

- **src/server.ts** — 入口；`app.listen(PORT||4000)`。**⚠ 未呼叫 `connectDB()`** → 玩家路由在無 DB 連線時會失敗。
- **src/app.ts** — 建立 Express app；`cors`+`json`；掛載 `/health`、`/api/health`、`/api/ai`、`/api/player`。
- **src/config/db.ts** — `connectDB()`：Mongoose 連 `MONGODB_URI`，失敗則 `process.exit(1)`。
- **src/models/Player.model.ts** — `IPlayer` 介面 + `PlayerSchema`（playerId 唯一、position、rotation、inventory、currentQuestId、lastLogin）。
- **src/routes/health.ts** — `GET /`：回 `HealthCheckResponse`。
- **src/routes/ai.ts** — `GET /health`：代理請求至 Python AI 服務（`AI_SERVICE_URL||localhost:8001`），含型別守衛 `isHealthCheckResponse`。
- **src/routes/player.ts** — `POST /init`（找不到則建立）、`GET /:playerId`、`PATCH /:playerId/state`（更新 position/rotation）。
- **src/models/player.ts** — ⚠ 與 routes/player.ts 重複的舊 router，**未掛載**，可刪。
- **src/index.ts** — 空 re-export。

### 3.5 apps/web — 入口與設定

- **main.tsx** — `createRoot().render(<StrictMode><App/></StrictMode>)`。
- **App.tsx** — 根組件。`useEffect` 初始化：`fetchHealthStatus()` → 若 ok 則 `playerApi.init('student_001','Freshman')` 設定出生位置。全域鍵盤：`I`=背包、`M`=地圖（對話中不開）、`Esc`=關地圖。掛載：`Scene3D`、`HUD`、`ClockHud`、`QuestTracker`、`DebugPanel`、`InteractionPrompt`、`MinigameOverlay`(lazy)、`DialogueBox`、`InventoryPanel`、`MapPanel`、`FastTravelMenu`、`EventSpawner`、`EventNotification`、`QuestNotification`、`UIOverlay`、`TransitionOverlay`。
- **vite.config.ts** — `/api` proxy 至後端、manualChunks 分包（three/react/ui/phaser vendor）。
- **services/api.ts** — axios `apiClient`（baseURL `/api`）+ 錯誤攔截器；`healthApi.check`、`playerApi.{init,updateState,getState}`。

### 3.6 apps/web/src/store（Zustand 狀態）

- **gameStore.ts** — 用途：核心玩家/世界狀態（**非 persist**）。重要欄位/動作：`playerPosition/velocity/grounded/currentFloor/movementMode`、`stamina`+`addStamina`/`consumePendingStaminaDelta`（跨幀 stamina delta 佇列）、`currentZone`+`setCurrentZone`、`interior/interiorReturn`+`setInterior/clearInterior`、`transitionState`+`setTransitionState`、`playerRotation/cameraYaw`、`nearbyInteractable`+`setNearbyInteractable`、`isMapOpen/toggleMap`、`setPlayerKinematics`（每幀單次批次寫入）。
- **inventoryStore.ts** — persist `cq-inventory`（只存 slots）。`addItem`（處理堆疊/上限）、`removeItem`、`hasItem`、`useItem`（消耗品→`addStamina`）、開關背包。依賴 game-data `getItemById`、gameStore。
- **questStore.ts** — `quests: Record<id,Quest>`；`addQuest`、`updateQuestStatus`、`openMiniGame/closeMiniGame`、`completeMiniGame`（標完成→`grantReward`→NPC 友好+25）。依賴 game-data、reward、friendshipStore。
- **friendshipStore.ts** — persist `cq-friendship`。`points`、`addFriendship`、`greet`（每phase首次+2）、`getLevel`；純函式 `friendshipLevel(points)`（7 個關係階層）。
- **clockStore.ts** — 日phase時鐘（**非 persist**）。`phase/day`、`advancePhase`（驅動 NPC 行程）、`setPhase`。
- **dialogueStore.ts** — 對話框狀態。`openDialogue/nextLine/closeDialogue`、`isOpen/lines/currentIndex`。
- **explorationStore.ts** — persist `cq-exploration`。`discoveredChunks`、`markDiscovered`（揭露 3×3 鄰域）、`isDiscovered`。
- **collectibleStore.ts** — persist `cq-collectibles`。`collectedIds`、`collect`、`isCollected`。
- **travelStore.ts** — persist `cq-travel`（只存 unlockedDistricts）。`unlockedDistricts`（預設 `['campus_outdoor']`）、`unlock/isUnlocked`、`isFastTravelOpen`+`openFastTravel/closeFastTravel`。
- **eventStore.ts** — **transient（不 persist）**。`activeEvents[]`、`spawn(def,zone,pos)`、`resolve(id)`、`expire(now)`、`lastSpawned/lastResolved`（toast 訊號）。

### 3.7 apps/web/src/world（純邏輯，無 R3F；利於單元測試）

- **chunks.ts** — 世界格網數學。`CHUNK_SIZE=64`、`CHUNK_LOAD_RADIUS=2`、`WORLD_SEED`；`worldToChunk`、`chunkCenter`、`chunksInRadius`、`chunkRng(cx,cz)`（→ mulberry32(hashString)）。
- **town-generator.ts** — 每 chunk 程序化城鎮。`generateChunk(cx,cz)`：南路 z=cz*64 / 西路 x=cx*64（`ROAD_W=8`），2×2 地塊（建築或公園），保留學校 chunk `cx∈[-1,0] cz∈[-1,0]`。
- **traffic.ts** — 環境交通佈局（Batch 6）。`generateChunkTraffic(cx,cz)`：sidewalks/crosswalks/trafficLights/vehicles/pedestrians（純資料、無碰撞、跳過保留 chunk）。
- **trafficSignal.ts** — 共用紅綠燈週期。`LIGHT_PERIOD=8`、`isAxisGreen(elapsed,axis)`（x 軸前半綠、z 軸後半）。
- **collectibles.ts** — 隱藏收集品生成。`generateChunkCollectibles(cx,cz)`（每 chunk 0–2 個、決定論、跳過保留 chunk）。依賴 game-data `COLLECTIBLE_ITEM_IDS`。
- **playerMovement.ts** — 移動/體力純函式。`MovementMode`、各速度常數、`resolveMovement`（walk/run/sprint + 遲滯）、`updateStamina`（sprint 耗、其餘回）。
- **spawn.ts** — 安全出生。`findGroundY(rapier,world,x,z,fromY,exclude)`：向下射線找地面 Y。
- **reward.ts** — 中央獎勵系統。`Reward{items?,stamina?,friendship?}`、`grantReward()`（→ inventory.addItem / gameStore.addStamina / friendshipStore.addFriendship）。

### 3.8 apps/web/src/data/maps（地圖資料 + 程序化生成器）★ 核心

- **prng.ts** — `mulberry32`、`hashString`、`shuffle`（決定論 PRNG）。
- **constants.ts** — `FLOOR_HEIGHT=6`、`floorBaseY(level)`、`getFloorFromY(y)`。
- **room-templates.ts** — `RoomDefinition/WallSegment/FurniturePlacement` 型別 + `ROOM_TEMPLATES`（~20 種房型：classroom_standard、library_reading、computer_lab、science_lab、gym_hall、dorm_room、shop_cafe、club_room… `ROOM_HEIGHT=5.2`，模組載入時套 `ROOM_SCALE` 放大）。
- **floor-generator.ts** — ★ 決定論連通樓層生成。`BuildingSpec/FloorSpec/RoomSpec` → `generateBuilding(spec): GeneratedBuilding`：雙欄打包房間、每房對中央走廊開門、走廊前端=入口/後端=樓梯井、跨樓層共用 footprint。輸出含 footprint/stairwell/floors(rooms+corridorWalls)。
- **building-archetypes.ts** — 城鎮建築原型（shop/cafe/house/apartment）：外觀 + `buildInteriorSpec()`（進屋時生成內部 BuildingSpec）。
- **buildings.ts** — 校園主題建築：`LIBRARY/ACADEMIC/CLUB_BUILDING_SPEC` → `CAMPUS_BUILDINGS`、`CampusBuildingLayout`、`CAMPUS_BUILDING_LAYOUTS`（外觀擺放）、`getBuildingByZone`。
- **campus-zones.ts** — ★ 區域註冊表。`ZoneDefinition`（streamedTown?/building?/fogColor/ambientLight/spawnPoint）、`MAIN_BUILDING_SPEC`、`CAMPUS_ZONES`（main_building_1f、campus_outdoor、library/academic/club、**riverside_outdoor/riverside_school、northhill_outdoor/northhill_school**、interior）。
- **schools.ts** — ★ 多校分區（Batch 7）。`SchoolDistrict`、`SCHOOL_DISTRICTS`（Starbridge/Riverside/Northhill）、`RIVERSIDE/NORTHHILL_BUILDING_SPEC`→`DISTRICT_BUILDINGS`、`FAST_TRAVEL_DESTINATIONS`、`getDistrict`、`isDistrictOutdoor`、`getOutdoorLayoutForZone`（回傳當前分區校舍+extras+公車站）。
- **zone-connections.ts** — `ZoneConnection`（portal/spawn 配對）、`MAIN/THEMED/DISTRICT_CONNECTIONS`、`getConnectionsFromZone`。
- **outdoor-templates.ts** — 早期固定戶外區模板（campus_plaza）。
- **pois.ts** — 地圖標記 POI。`Poi{type:'npc'|'quest'|'building'}`、`getPoisForZone`。
- **index.ts** — re-export room-templates/campus-zones/zone-connections。

### 3.9 apps/web/src/data — 其他資料

- **events.ts** — 隨機事件定義（web-local，Batch 8）。`EventDefinition{kind,toast,durationMs,reward}`、`EVENT_DEFINITIONS`（6 個：lost_item/traffic/library_glitch/club_emergency/rumor…）、`getEventDefById`。
- **quests.ts** — re-export game-data 的 `QUEST_DEFINITIONS as INITIAL_QUESTS`（供 DialogueBox 接任務）。

### 3.10 apps/web/src/hooks

- **useInteraction.tsx** — `useInteraction({targetPosition,radius,onEnter,onExit}): boolean`：每幀算 XZ 距離，edge-triggered 進/出範圍回呼。**所有 E 互動的基礎。**
- **useZoneTransition.ts** — `triggerTransition(connection)`：fadeOut(500ms)→`setCurrentZone`+spawn→fadeIn。
- **useFastTravel.ts** — `travelTo(district)`：動態組 `ZoneConnection`→`unlock`→`triggerTransition`（Batch 7）。
- **useEnterBuilding.ts** — `enterBuilding(placement)`（生成城鎮內部→進入 `interior` zone）/`exitBuilding()`（回 campus_outdoor）。
- **useThrottle.tsx** — 泛型節流（含 trailing call），用於玩家位置同步後端。

### 3.11 apps/web/src/components — 3D 場景與世界物件

- **Scene3D.tsx** — R3F `<Canvas>`：背景/fog/Sky/燈光、`<Physics>`(WorldGround+CampusMap+PlayerController)、非物理層 `NpcSpawner`/`EventMarkers`/示範 QuestTrigger/PickupItem、`FollowCamera`、`Stats`。內含 `NpcSpawner`（依 zone+phase 渲染 NPC）、`EventMarkers`（依 zone 渲染事件）。
- **PlayerController.tsx** — ★ 玩家控制核心。Rapier `KinematicCharacterController`：WASD 相對相機移動、Shift 衝刺、Space 跳（邊緣觸發+體力）、重力積分、autostep/snap-to-ground、落出界回安全點、出生/傳送以射線坐地、每幀批次寫 gameStore、節流同步後端。依賴 playerMovement、spawn、gameStore、dialogueStore。
- **FollowCamera.tsx** — 第三人稱軌道相機：指標拖曳轉 yaw/pitch、滾輪縮放、lerp 平滑跟隨、寫回 `cameraYaw`。
- **architecture/CampusMap.tsx** — ★ 依 `currentZone` 決定渲染：`interior`(生成內部+ExitPortal) / `building`(固定校舍內部) / `streamedTown`(ChunkManager + 依 `getOutdoorLayoutForZone` 的當前分區校舍+extras+BusStop) + ZonePortal。
- **architecture/Building.tsx** — 渲染 `GeneratedBuilding`：每層 FloorSlab(含樓梯井洞)、RoomBuilder、走廊牆、Stairs、外殼+窗帶+屋頂。
- **architecture/RoomBuilder.tsx** — 渲染單一房間（地板/天花 + Wall + Furniture）。
- **architecture/Wall.tsx** — 牆段（依 `WallSegment` 支援門/窗開口），帶剛體碰撞。
- **architecture/Stairs.tsx** — 程序化階梯（帶碰撞），rise=樓高。
- **architecture/FloorSlab.tsx** — 樓板（支援 `SlabOpening` 樓梯井挖洞），帶碰撞。
- **architecture/Furniture.tsx** — 依 `FURNITURE_CONFIG` 渲染家具盒（desk/chair/bookshelf/counter/bed/locker/terminal），帶碰撞。
- **architecture/SchoolExterior.tsx** — 靜態校舍外觀（牆/窗/入口門廊/招牌 Text/可選圍籬）；非傳送門本身。
- **architecture/OutdoorProps.tsx** — `PROP_COMPONENTS` 派發：tree/bench/lamppost/fountain/signpost/bush（帶碰撞）。
- **architecture/ZonePortal.tsx** — 傳送門：`useInteraction`→E→`triggerTransition(connection)`；脈動發光 + 標籤。
- **world/ChunkManager.tsx** — 串流城鎮：依玩家所在 chunk 維持半徑內 Chunk 掛載、跨 chunk 才重算、`markDiscovered`。
- **world/Chunk.tsx** — 單一 chunk 渲染：地面碰撞、道路、公園、Props、TownBuilding、收集品、**+ 交通（sidewalks/crosswalks/trafficLights/vehicles/pedestrians）**；rise-in 淡入。
- **world/TownBuilding.tsx** — 可進入的城鎮建築外觀；近門 E → `enterBuilding`（生成內部）。
- **world/InteriorExitPortal.tsx** — 生成內部的出口標記；E → `exitBuilding`。
- **world/Vehicle.tsx** — 車/黃校車/腳踏車（box 組）；`useFrame` 沿車道對 chunk 取模前進、**紅燈(`!isAxisGreen`)凍結**、朝行進方向（Batch 6）。
- **world/Pedestrian.tsx** — 行人 capsule，沿人行道 loop + 走路 bob（Batch 6）。
- **world/TrafficProps.tsx** — `Sidewalk`/`Crosswalk`/`TrafficLight`（燈頭依 `isAxisGreen` 切紅綠 emissive）。
- **world/BusStop.tsx** — 公車站（候車亭+站牌，柱有碰撞）；近站 E → `openFastTravel`（Batch 7）。
- **world/NpcCharacter.tsx** — 資料驅動 NPC：依行程定位、E 開對話、每phase首次 `greet` 加友好、顯示關係階層。
- **world/EventSpawner.tsx** — 非視覺；`setInterval`(7s) 在 streamedTown zone 且 < cap(3) 時於玩家附近 spawn 隨機事件、prune 過期（Batch 8）。
- **world/EventMarker.tsx** — 事件 3D 信標（旋轉/浮動）；近 E → `grantReward(def.reward)`+`resolve`（Batch 8）。

### 3.12 apps/web/src/components — UI Overlay（Tailwind / React）

- **HUD.tsx** — 左上：玩家名、HP、體力條（衝刺時變色）。
- **DebugPanel.tsx** — 除錯面板：位置/速度/grounded/floor/zone/stamina/mode（`isDebugMode` 切換）。
- **ClockHud.tsx** — 頂中：當前日phase + 「推進」按鈕（`advancePhase`）。
- **InventoryPanel.tsx** — 背包格（`I` 開關），點消耗品 `useItem`。
- **QuestTracker.tsx** — 右上：進行中任務 + 完成數。
- **QuestNotification.tsx** — 任務狀態變動 toast（3s 自動隱藏）。
- **EventNotification.tsx** — 事件 spawn/resolve toast（watch `lastSpawned/lastResolved`，3s）。
- **DialogueBox.tsx** — 對話框；Space/Enter 推進，最後一行若帶 `questId` 則從 `INITIAL_QUESTS` 接任務（available→active）。
- **MapPanel.tsx** — 全螢幕地圖（`M`）：戶外畫 chunk（未探索變暗）/室內畫樓層平面 + 樓層選擇；POI、玩家、**事件 ★、對已解鎖分區的快速旅行按鈕**。
- **FastTravelMenu.tsx** — 快速旅行疊層（公車站/地圖觸發）：列出目的地→`travelTo`（公車可達任何地、抵達後解鎖）。
- **MinigameOverlay.tsx** — Phaser 容器（`activeMiniGame` 時掛載），監聽 `minigame-complete`→`completeMiniGame`。
- **QuestTrigger.tsx** — 任務點 3D 標記（任務 active 才顯示）；E → `openMiniGame`。
- **PickupItem.tsx** — 世界拾取物（浮動旋轉）；E → `addItem`。
- **InteractionPrompt.tsx** — 螢幕中央「[E] …」提示（依 `nearbyInteractable`）。
- **TransitionOverlay.tsx** — 黑幕淡入淡出（依 `transitionState`）。
- **UIOverlay.tsx** — 底部動作列（背包/地圖/除錯按鈕）+ 服務健康狀態。

### 3.13 apps/web/src/phaser

- **scenes/LibrarySortScene.ts** — `LibrarySortScene extends Phaser.Scene`：拖曳書本到正確書架（history/science/literature）；全部分類完成 → emit `minigame-complete`。

### 待辦 / mock（程式碼內標記與觀察）
- AI 服務全為 **mock**（main.py 註明「Will be replaced with actual LLM integration later」）。
- `app/api/*` router **未掛載**到 main.py；`schemas/dialogue.py` 的 `from typing import list` 為**錯誤 import**。
- `apps/api/src/server.ts` **未呼叫 `connectDB()`**（玩家路由需 DB）。
- `apps/api/src/models/player.ts` 為重複舊 router（未使用）。
- `room-templates.ts:301` 註解：該房型 walls 為 placeholder，由 floor-generator 重建。
- `scripts/check-health.mjs` 的埠號（5173/3000/8000）與實際（web 5173?/api 4000/ai 8001）**不一致**。
- game-data 的 `maps/*` 與 web 的 `data/maps/*` **資料重複**，web 僅用後者。

---

## 4. 核心邏輯流程

### 4.1 啟動與主執行路徑
```
main.tsx → <App/>
  App.useEffect: GET /api/health → 若 ok → playerApi.init() → setPlayerPosition
  App render:
    <Scene3D/>  (R3F Canvas)
      <Physics>
        WorldGround（地面碰撞）
        <CampusMap/> ── 依 currentZone 分支渲染世界
        <PlayerController/> ── 每幀驅動玩家（見 4.2）
      NpcSpawner / EventMarkers（非物理）
      FollowCamera（跟隨相機，寫 cameraYaw）
    + 所有 UI overlay（HUD/Map/Dialogue/Inventory/…）
    + EventSpawner（背景計時生成事件）
```

### 4.2 每幀玩家迴圈（PlayerController.useFrame）
```
讀 keys + cameraYaw（gameStore）
→ 落出界？ 回 lastSafePos / zone.spawnPoint
→ locked?（對話/傳送/互動中）→ 凍結輸入
→ resolveMovement(input,stamina) → mode/speed；updateStamina；套用外部 stamina delta（消耗品/獎勵）
→ 以相機朝向計算位移向量；跳躍（grounded+體力）；重力積分
→ KinematicCharacterController.computeColliderMovement → setNextKinematicTranslation
→ setPlayerKinematics(批次寫 gameStore)；節流 syncToServer(PATCH /player/:id/state)
```

### 4.3 區域渲染決策（CampusMap）
```
currentZone === 'interior'        → 生成的城鎮內部 + InteriorExitPortal
zone.building 存在                → <Building>（固定校舍/分區校舍內部）
zone.streamedTown === true        → <ChunkManager> + getOutdoorLayoutForZone(zone)
                                     ↳ 主校舍 SchoolExterior + extras + BusStop
+ getConnectionsFromZone(zone).map(ZonePortal)
```

### 4.4 世界串流資料流（決定論）
```
ChunkManager（玩家所在 chunk 半徑 2）→ 多個 <Chunk cx,cz>
  Chunk:
    generateChunk(cx,cz)            → 道路/建築/公園/props（town-generator）
    generateChunkTraffic(cx,cz)     → 交通（traffic + trafficSignal）
    generateChunkCollectibles(cx,cz)→ 隱藏收集品（collectibles）
  全部以 chunkRng(cx,cz)=mulberry32(hashString(seed:cx:cz)) 取得 → 同座標永遠相同
```

### 4.5 互動模式（統一）
```
任何可互動物件：useInteraction({targetPosition,radius,onEnter:setNearbyInteractable,onExit})
  → 進範圍顯示「[E] …」(InteractionPrompt)
  → 範圍內監聽 keydown 'e' → 執行動作
應用：ZonePortal(傳送)、TownBuilding(進屋)、BusStop(快速旅行)、NpcCharacter(對話)、
      QuestTrigger(mini-game)、PickupItem(拾取)、EventMarker(結算事件)
```

### 4.6 任務與獎勵流
```
NPC 對話最後一行帶 questId → DialogueBox 從 INITIAL_QUESTS 接任務(active)
→ QuestTrigger(active) E → openMiniGame → MinigameOverlay 載入 Phaser 場景
→ 場景 emit 'minigame-complete' → questStore.completeMiniGame
   → updateQuestStatus(completed) + grantReward(items) + addFriendship(+25)
獎勵中央化：grantReward({items?,stamina?,friendship?}) → inventory/gameStore/friendship
```

### 4.7 快速旅行 / 隨機事件
```
快速旅行：BusStop E → openFastTravel → FastTravelMenu 選目的地 → travelTo
  → unlock(district) → triggerTransition（動態 ZoneConnection 到分區 spawn）
  地圖：MapPanel 對「已解鎖」分區顯示快速旅行按鈕
隨機事件：EventSpawner(7s) 於 streamedTown + 活躍<3 → eventStore.spawn
  → EventMarker 顯示信標；玩家 E → grantReward + resolve；過期則 expire
  → EventNotification toast + MapPanel ★ 標記
```

### 4.8 持久化
- **後端 MongoDB**：僅玩家 position/rotation（透過 `/player` 路由）。
- **localStorage（Zustand persist）**：`cq-inventory`、`cq-friendship`、`cq-exploration`、`cq-collectibles`、`cq-travel`。
- **transient（記憶體）**：gameStore、questStore、clockStore、dialogueStore、eventStore。

---

## 5. 對外介面

### 5.1 Node API（apps/api，預設埠 4000）
| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/health`、`/api/health` | 服務健康檢查（回 `HealthCheckResponse`） |
| GET | `/api/ai/health` | 代理 Python AI 服務健康檢查 |
| POST | `/api/player/init` | body `{playerId,name?}`；找不到則建立，回 `PlayerState` |
| GET | `/api/player/:playerId` | 取玩家狀態 |
| PATCH | `/api/player/:playerId/state` | body `{position?,rotation?}`；更新並回新狀態 |

### 5.2 Python AI 服務（apps/ai-service，埠 8001；目前 mock）
| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/health` | 健康檢查 |
| POST | `/ai/v1/dialogue/generate` | body `{npc_id,player_input,context}` → `{npc_reply,emotion}`（mock） |
> 註：`app/api/{health,dialogue,events,hints}.py` 內另有 router，但**尚未掛載**到 main.py。

### 5.3 前端 API 客戶端（services/api.ts）
- `healthApi.check()`
- `playerApi.init(playerId, name?)` / `playerApi.updateState(playerId, {position?,rotation?})` / `playerApi.getState(playerId)`

### 5.4 主要可重用函式簽章（前端）
```ts
// 世界生成（決定論）
generateChunk(cx, cz): ChunkData
generateChunkTraffic(cx, cz): ChunkTraffic
generateChunkCollectibles(cx, cz): CollectiblePlacement[]
chunkRng(cx, cz): Rng
generateBuilding(spec: BuildingSpec): GeneratedBuilding
isAxisGreen(elapsed, axis: 'x'|'z'): boolean

// 移動 / 出生
resolveMovement({moving,shift,stamina,wasSprinting}): {mode,speed}
updateStamina(stamina, mode, dt): number
findGroundY(rapier, world, x, z, fromY, exclude?): number | null

// 區域 / 旅行 / 獎勵
triggerTransition(connection: ZoneConnection): Promise<void>      // useZoneTransition
travelTo(district: SchoolDistrict): void                          // useFastTravel
getOutdoorLayoutForZone(zoneId): OutdoorLayout | null
grantReward({items?, stamina?, friendship?}): void

// 互動
useInteraction({targetPosition, radius?, onEnter?, onExit?}): boolean
```

### 5.5 CLI / 腳本
- `npm run dev`（root）— concurrently 同啟 web + api + ai。
- `npm run build` / `build:web` / `build:api`。
- `npm run check:health` — `scripts/check-health.mjs`（⚠ 埠號需更新）。
- game-data：在 `packages/game-data` 跑 `npm run build`（tsc）以更新 dist。

---

## 附錄：常見開發注意事項
- 修改地圖/區域 → `apps/web/src/data/maps/*`（**非** game-data/maps）。
- 修改 NPC/任務/物品 → `packages/game-data/src/*` 後**必須**重編該套件 dist，web 才看得到。
- 每批驗收門檻：`cd apps/web && npm run build`（tsc + vite）。專案**無自動測試套件**；純邏輯（`world/*.ts`、`data/maps/*`）刻意保持 framework-free 以利日後單元測試。
- 程式碼/註解/檔名/commit 一律英文（對話用中文）；不引入大型外部 3D 資產（僅 R3F primitives）。
