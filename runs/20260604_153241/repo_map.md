# Campus Quest 3D — Repository Map

> Generated: 2026-06-04T15:32:41Z
> Run ID: 20260604_153241
> Branch context: `feat/gameplay-foundation` (Batches 1–8+)

---

## 1. High-Level Architecture Overview

**Campus Quest 3D** is a full-stack 3D campus adventure RPG built as an **npm workspaces monorepo** with a standalone Python AI service. The game features a procedurally generated open world, multi-floor walkable buildings, NPC interactions, quests with mini-games, a friendship system, fast travel across school districts, and random events.

### Monorepo Structure

```
campus-quest-3d/                     # Root workspace (npm workspaces)
├── apps/
│   ├── web/                         # React + Three.js frontend (Vite)
│   ├── api/                         # Node.js + Express backend (Mongoose/MongoDB)
│   └── ai-service/                  # Python FastAPI AI service (standalone, not in npm)
├── packages/
│   ├── shared-types/                # Shared TypeScript type definitions (pure types)
│   └── game-data/                   # Shared game data (items, NPCs, quests, maps)
├── scripts/                         # Utility scripts (health check)
├── docker/                          # Docker configs (MongoDB init)
├── docs/                            # Project documentation
├── docker-compose.dev.yml           # Dev environment (MongoDB, mock AI, API, Web)
└── docker-compose.prod.yml          # Prod environment (+ llama.cpp, Prometheus, Grafana)
```

### Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        apps/web (React + R3F)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Scene3D  │  │ Player   │  │ UI       │  │ Phaser        │  │
│  │ (R3F)    │  │ Controller│ │ Overlays │  │ Mini-games    │  │
│  └────┬─────┘  └────┬─────┘  └──────────┘  └───────────────┘  │
│       │              │                                           │
│  ┌────▼──────────────▼──────────────────────────────────────┐  │
│  │              Zustand Stores (12 stores)                   │  │
│  │  gameStore · inventoryStore · questStore · friendshipStore│  │
│  │  clockStore · dialogueStore · explorationStore · eventStore│ │
│  │  collectibleStore · travelStore · metricsStore            │  │
│  └────┬─────────────────────────────────────────────────────┘  │
│       │                                                          │
│  ┌────▼──────────────────────────────────────────────────────┐  │
│  │         World Logic (pure, framework-free)                 │  │
│  │  chunks · town-generator · traffic · collectibles          │  │
│  │  playerMovement · spawn · reward · trafficSignal           │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────┬──────────────────────┬───────────────────────────┘
               │ axios (/api proxy)   │ file: dependency
               ▼                      ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│     apps/api (Express)   │  │   packages/game-data          │
│  ┌────────────────────┐  │  │   items · npcs · quests       │
│  │ Routes             │  │  │   maps (legacy, unused by web)│
│  │ /health /api/health│  │  └──────────────────────────────┘
│  │ /api/ai  /api/player│ │
│  └────────┬───────────┘  │  ┌──────────────────────────────┐
│           │              │  │   packages/shared-types       │
│  ┌────────▼───────────┐  │  │   Vector3 · HealthCheck       │
│  │ Services           │  │  │   PlayerState · QuestStatus   │
│  │ PlayerSync · Quest │  │  └──────────────────────────────┘
│  │ Session · Event    │  │
│  │ Inventory · Leader │  │
│  └────────┬───────────┘  │
│           │              │
│  ┌────────▼───────────┐  │
│  │ MongoDB (Mongoose) │  │
│  │ Player model       │  │
│  └────────────────────┘  │
└──────────┬───────────────┘
           │ HTTP proxy
           ▼
┌──────────────────────────────────────────────────────────────┐
│              apps/ai-service (Python FastAPI)                  │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Dialogue   │  │ LLM Service  │  │ RAG Service         │  │
│  │ Events     │  │ (llama.cpp)  │  │ (ChromaDB + SBERT)  │  │
│  │ Hints      │  │              │  │                     │  │
│  └────────────┘  └──────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### Languages & Runtime
| Layer | Language | Version | Module System |
|-------|----------|---------|---------------|
| Frontend | TypeScript | ~6.0.2 | ESM |
| Backend API | TypeScript | ~5.7.3 | ESM (`"type": "module"`) |
| AI Service | Python | 3.10+ | Standard |
| Shared Packages | TypeScript | ~5.7.3 | ESM |

### Frontend (`apps/web`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2.6 | UI framework |
| Three.js | 0.184.0 | 3D rendering engine |
| @react-three/fiber | 9.6.1 | React renderer for Three.js |
| @react-three/drei | 10.7.7 | R3F helpers (Text, Sky, Stats, etc.) |
| @react-three/rapier | 2.2.0 | Physics engine (KinematicCharacterController) |
| Zustand | 5.0.14 | State management (with persist middleware) |
| Phaser | 4.1.0 | 2D mini-game engine |
| Tailwind CSS | 4.3.0 | UI styling |
| Vite | 8.0.12 | Build tool & dev server |
| Framer Motion | 12.40.0 | Animations |
| Axios | 1.16.1 | HTTP client |
| Lucide React | 1.17.0 | Icons |

### Backend (`apps/api`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | >= 18 | Runtime |
| Express | 4.21.2 | HTTP framework |
| Mongoose | 8.24.0 | MongoDB ODM |
| MongoDB | 7.0 | Database |
| Zod | 3.24.1 | Schema validation |
| JWT (jsonwebtoken) | 9.0.2 | Auth tokens (installed, partially wired) |
| bcryptjs | 2.4.3 | Password hashing (installed, not yet used) |
| tsx | 4.19.2 | Dev runner (watch mode) |

### AI Service (`apps/ai-service`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| FastAPI | 0.136.3 | Python web framework |
| Pydantic | 2.13.4 | Data validation |
| uvicorn | 0.48.0 | ASGI server |
| httpx | >= 0.27.0 | Async HTTP client (llama.cpp) |
| ChromaDB | >= 0.4.22 | Vector DB for RAG |
| sentence-transformers | >= 2.2.2 | Embeddings (all-MiniLM-L6-v2) |
| llama.cpp | (Docker) | Local LLM inference (Qwen 2.5 7B) |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Docker Compose | Dev & prod orchestration |
| Prometheus | Metrics scraping |
| Grafana | Metrics visualization |
| npm workspaces | Monorepo package management |
| concurrently | Parallel dev server startup |

---

## 3. Game Features Implemented

### 3.1 3D World & Exploration
- **Procedural town streaming**: Infinite chunk-based world (64×64 chunks, load radius 2), deterministic generation via mulberry32 PRNG
- **Multi-floor buildings**: Data-driven floor generator with corridors, rooms, stairwells, and doorways (~20 room templates)
- **Campus buildings**: Main Building (3F), Library (2F), Science Hall (3F), Club House (2F) — all walkable with physics
- **Town buildings**: Enterable shops, cafes, houses, apartments with generated interiors
- **Outdoor props**: Trees, benches, lampposts, fountains, bushes, signs (with collision)
- **Zone portals**: Teleportation between zones with fade transition
- **Fog & ambient lighting**: Per-zone atmosphere settings

### 3.2 Player Controller
- **Kinematic character**: Rapier-based KinematicCharacterController with WASD movement
- **Camera-relative movement**: Third-person orbit camera with pointer drag rotation, scroll zoom
- **Sprint system**: Walk (2.5 m/s) → Run (5 m/s) → Sprint (8 m/s) with hysteresis
- **Stamina**: 100 max, sprint drains 25/s, regen 15/s, jump costs 12
- **Jumping**: Grounded detection, edge-triggered jump with stamina cost
- **Gravity & ground snapping**: Autostep, snap-to-ground, fall-out-of-world recovery
- **Server sync**: Throttled position sync with optimistic updates and reconciliation

### 3.3 NPC System
- **6 NPCs**: Alice (Librarian), Bob (Club President), Mei (Transfer Student), Mr. Sato (Science Teacher), Hana (Riverside Student), Mr. Kenji (Northhill Teacher)
- **Day-phase schedules**: Each NPC moves between zones based on morning/afternoon/evening
- **Dialogue system**: Multi-line conversations with quest triggers on final line
- **Friendship system**: 7 relationship tiers (Rival → Best Friend), per-phase greeting bonus (+2), quest completion bonus (+25)
- **Favorite items**: Each NPC has preferred gift items

### 3.4 Quest System
- **2 quests defined**:
  - `q_library_sort`: Restore the Library Catalog (talk to Alice → Phaser mini-game → get keycard)
  - `q_cross_school_exchange`: Inter-School Exchange (Mei → bus to Riverside → find Hana → get chocolates)
- **Quest lifecycle**: locked → available → active → completed/failed
- **Mini-game integration**: Phaser-based LibrarySortScene (drag books to correct shelves)
- **Server-side quest service**: HMAC-signed transitions, prerequisite checks, achievement tracking

### 3.5 Inventory System
- **20 slot inventory** with stackable items and max stack limits
- **16 item types**: keys, keycards, consumables, materials, quest items, collectibles, gifts, documents, flyers, map fragments
- **Consumable effects**: Energy Drink (+30 stamina), Rice Ball (+15), Canned Coffee (+20)
- **Persistent**: Saved to localStorage (`cq-inventory`)

### 3.6 Fast Travel & Multi-School
- **3 school districts**: Starbridge (home), Riverside, Northhill
- **Bus stops**: Interactive bus stops open fast-travel menu
- **District unlocking**: First visit via bus unlocks for instant map travel
- **Map panel**: Full-screen map with chunk fog-of-war, POI markers, fast-travel buttons for unlocked districts

### 3.7 Random Events
- **6 event types**: Lost Wallet, Traffic Jam, Library Terminal Glitch, Club Flyer Rush, Whispered Rumor, Shared Snacks
- **Spawning**: Every 7 seconds in outdoor zones, max 3 active, near player
- **Resolution**: Walk up and press E for rewards (items, stamina, friendship)
- **Expiration**: Events expire after 35–50 seconds if not resolved
- **Toast notifications**: Spawn and resolve announcements

### 3.8 Collectibles
- **5 hidden collectible types**: Star Coin, Campus Sticker, Lucky Charm, Old Photo, Mascot Pin
- **Deterministic spawning**: 0–2 per chunk, deterministic positions
- **Persistent collection**: Remembered in localStorage (`cq-collectibles`)

### 3.9 Traffic System
- **Ambient traffic**: Cars, buses, bikes looping on roads
- **Pedestrians**: Walking on sidewalks with bob animation
- **Traffic lights**: Global synchronized cycle (8s period, x-axis green first half, z-axis second half)
- **Red light behavior**: Vehicles freeze on red, pedestrians continue

### 3.10 UI Overlays
- **HUD**: Player name, health bar, stamina bar (color changes during sprint)
- **Clock HUD**: Day phase display with manual advance button
- **Debug Panel**: Position, velocity, grounded state, floor, zone, stamina, movement mode
- **Quest Tracker**: Active quests with completion count
- **Inventory Panel**: Grid-based inventory with consumable use (I key)
- **Map Panel**: Full-screen map with fog-of-war, POI, floor plans, fast travel (M key)
- **Dialogue Box**: NPC conversation UI with Space/Enter progression
- **Interaction Prompt**: Context-sensitive "[E] ..." prompt
- **Transition Overlay**: Fade-to-black zone transitions
- **Event/Quest Notifications**: Toast messages for state changes

---

## 4. Database Models & Schemas

### MongoDB: `campus_quest` database

#### Player Collection (`players`)
```typescript
interface IPlayer {
  playerId: string;           // Unique identifier
  name: string;               // Display name
  position: Vector3;          // { x, y, z }
  rotation: number;           // Yaw angle
  inventory: InventoryItem[]; // { itemId, quantity, acquiredAt }
  stamina: number;            // Default: 100
  level: number;              // Default: 1
  currentZone: string;        // Default: 'main_building_1f'
  currentQuestId?: string;
  questProgress: Record<string, QuestProgressEntry>;
  friendship: Record<string, FriendshipEntry>;
  exploration: { discoveredChunks: string[] };
  collectibles: { collectedIds: string[] };
  lastEventResolved: Record<string, number>;
  lastSyncAt?: Date;
  lastLogin: Date;
}
```

#### MongoDB Indexes (from `docker/mongodb/init.js`)
| Index | Fields | Purpose |
|-------|--------|---------|
| `idx_playerId_unique` | `playerId: 1` | Unique player lookup |
| `idx_lastLogin_ttl` | `lastLogin: -1` | Session cleanup queries |
| `idx_zone_activity` | `currentZone: 1, lastLogin: -1` | Active players by zone |
| `idx_quest_status_partial` | `questProgress.status: 1` | Partial index (active/failed) |
| `idx_inventory_items` | `inventory.itemId: 1` | Sparse inventory lookup |

---

## 5. API Endpoints

### Node.js API (`apps/api`, port 4000)

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/health` | Service health check | None |
| `GET` | `/api/health` | Service health check (alias) | None |
| `GET` | `/api/ai/health` | Proxy to AI service health | None |
| `POST` | `/api/player/init` | Initialize or fetch player | None |
| `GET` | `/api/player/:playerId` | Get full player state | None |
| `PATCH` | `/api/player/:playerId/state` | Update position/rotation | None |
| `PATCH` | `/api/player/:playerId/sync` | Incremental state sync | None |
| `GET` | `/api/player/:playerId/summary` | Lightweight player summary | None |
| `POST` | `/api/player/:playerId/batch-sync` | Batch sync with conflict resolution | Optional JWT |

### Python AI Service (`apps/ai-service`, port 8001)

| Method | Path | Description | Status |
|--------|------|-------------|--------|
| `GET` | `/health` | Health check | ✅ Active |
| `POST` | `/ai/v1/dialogue/generate` | Generate NPC dialogue via LLM | ✅ Active (LLM with mock fallback) |
| `POST` | `/ai/v1/dialogue/npc` | Mock NPC dialogue | ✅ Active |
| `GET` | `/ai/v1/events/daily` | Generate daily campus event | ✅ Active (mock) |
| `POST` | `/ai/v1/hints/quest` | Generate staged quest hints | ✅ Active (mock) |

### Frontend API Client (`apps/web/src/services/api.ts`)
- `healthApi.check()` → `GET /api/health`
- `playerApi.init(playerId, name?)` → `POST /api/player/init`
- `playerApi.updateState(playerId, state)` → `PATCH /api/player/:id/state`
- `playerApi.getState(playerId)` → `GET /api/player/:id`
- `playerSyncApi.syncState(playerId, delta)` → `PATCH /api/player/:id/sync`
- `playerSyncApi.getSummary(playerId)` → `GET /api/player/:id/summary`
- `playerSyncApi.syncStateWithRetry(playerId, delta, maxRetries)` → sync with exponential backoff

---

## 6. Backend Services (apps/api/src/services/)

| Service | File | Purpose |
|---------|------|---------|
| **PlayerSyncService** | `playerSyncService.ts` | Server-authoritative sync with LWW conflict resolution, batch sync |
| **QuestService** | `questService.ts` | Quest state machine (locked→available→active→completed/failed), HMAC signatures, prerequisites, achievements |
| **SessionService** | `sessionService.ts` | In-memory session tracking (active/idle/offline), offline sync buffer |
| **EventService** | `eventService.ts` | Server-side event resolution with reward granting |
| **InventoryService** | `inventoryService.ts` | Server-authoritative inventory operations with effect application |
| **LeaderboardService** | `leaderboardService.ts` | MongoDB aggregation pipelines for 4 leaderboard categories |

### Backend Middleware
| Middleware | File | Purpose |
|-----------|------|---------|
| **Auth** | `auth.ts` | JWT verification (optional in dev, required in prod) |
| **CORS** | `cors.ts` | Configurable origin whitelist |
| **Rate Limit** | `rateLimit.ts` | In-memory sliding window (sync: 5/s, quest: 10/5s, read: 30/s) |
| **Validate** | `validate.ts` | Zod schema validation for request params/query/body |

### Backend Utilities
| Utility | File | Purpose |
|---------|------|---------|
| **Conflict Resolver** | `conflictResolver.ts` | CRDT-inspired: LWW, array merge, record merge, vector clocks |
| **Crypto** | `crypto.ts` | HMAC-SHA256 signing/verification, nonce generation, replay prevention |
| **Logger** | `logger.ts` | Structured logging (JSON in prod, pretty in dev) |
| **Telemetry** | `telemetry.ts` | Prometheus-compatible metrics collector (counters, gauges, histograms) |

---

## 7. Frontend State Management (Zustand Stores)

| Store | File | Persisted | Key | Purpose |
|-------|------|-----------|-----|---------|
| **gameStore** | `gameStore.ts` | No | — | Core player/world state, kinematics, sync queue, zone, interior |
| **inventoryStore** | `inventoryStore.ts` | Yes | `cq-inventory` | Item slots, add/remove/use items |
| **questStore** | `questStore.ts` | No | — | Quest tracking, mini-game lifecycle |
| **friendshipStore** | `friendshipStore.ts` | Yes | `cq-friendship` | NPC friendship points, relationship tiers |
| **clockStore** | `clockStore.ts` | No | — | Day phase clock (morning/afternoon/evening) |
| **dialogueStore** | `dialogueStore.ts` | No | — | Dialogue box state, line progression |
| **explorationStore** | `explorationStore.ts` | Yes | `cq-exploration` | Discovered chunk fog-of-war |
| **collectibleStore** | `collectibleStore.ts` | Yes | `cq-collectibles` | Collected hidden items |
| **travelStore** | `travelStore.ts` | Yes | `cq-travel` | Unlocked fast-travel districts |
| **eventStore** | `eventStore.ts` | No | — | Active random events, spawn/resolve signals |
| **metricsStore** | `metricsStore.ts` | No | — | Dev metrics (chunk count, sync latency, etc.) |

---

## 8. World Generation System

### Chunk System (`apps/web/src/world/`)
- **Chunk size**: 64×64 world units
- **Load radius**: 2 chunks (Chebyshev distance) = 25 chunks loaded
- **World seed**: `0x7a1c3`
- **Deterministic PRNG**: `mulberry32(hashString(seed:cx:cz))` — same coordinates always produce same layout
- **Reserved chunks**: `cx ∈ [-1,0], cz ∈ [-1,0]` reserved for school campus

### Generation Pipeline (per chunk)
1. `generateChunk(cx, cz)` → Roads, buildings (2×2 lots), parks, props
2. `generateChunkTraffic(cx, cz)` → Sidewalks, crosswalks, traffic lights, vehicles, pedestrians
3. `generateChunkCollectibles(cx, cz)` → 0–2 hidden collectibles per chunk

### Building Generation (`apps/web/src/data/maps/`)
1. **Room templates** (`room-templates.ts`): ~20 room types with walls, furniture, dimensions
2. **Floor generator** (`floor-generator.ts`): Deterministic corridor-connected multi-floor layouts
3. **Building specs** (`buildings.ts`, `campus-zones.ts`): Define floors and room compositions
4. **Building archetypes** (`building-archetypes.ts`): Town building types (shop/cafe/house/apartment)

### Zone Registry
| Zone ID | Type | Description |
|---------|------|-------------|
| `main_building_1f` | Building | 3-floor main school building |
| `campus_outdoor` | Streamed Town | Infinite procedural town |
| `library_building` | Building | 2-floor library |
| `academic_building` | Building | 3-floor science hall |
| `club_building` | Building | 2-floor club house |
| `riverside_outdoor` | Streamed Town | Riverside school district |
| `riverside_school` | Building | Riverside school interior |
| `northhill_outdoor` | Streamed Town | Northhill school district |
| `northhill_school` | Building | Northhill school interior |
| `interior` | Dynamic | On-entry generated town building interior |

---

## 9. Game Data Package (`packages/game-data`)

### Items (16 definitions)
- **Keys/Access**: Library Keycard, Club Badge
- **Materials**: Corrupted Data Fragment
- **Consumables**: Energy Drink (+30), Rice Ball (+15), Canned Coffee (+20)
- **Gifts**: Flower Bouquet, Box of Chocolates
- **Documents**: Library Document, Rumor Note, Club Flyer, Map Fragment
- **Collectibles** (hidden): Star Coin, Campus Sticker, Lucky Charm, Old Photo, Mascot Pin

### NPCs (6 definitions)
| NPC | Role | Home Zone | Quests |
|-----|------|-----------|--------|
| Alice | Librarian | Library | q_library_sort |
| Bob | Club President | Club House | — |
| Mei | Transfer Student | Campus Outdoor | q_cross_school_exchange |
| Mr. Sato | Science Teacher | Academic | — |
| Hana | Riverside Student | Riverside | — |
| Mr. Kenji | Northhill Teacher | Northhill | — |

### Quests (2 definitions)
| Quest | NPC | Zone | Mini-game | Reward |
|-------|-----|------|-----------|--------|
| Restore the Library Catalog | Alice | Library Plaza | LibrarySortScene | Library Keycard |
| Inter-School Exchange | Mei | Riverside | — | Box of Chocolates |

---

## 10. AI Service Architecture

### Current State
- **Dialogue generation**: Routes through `LLMService` → `LlamaCppClient` → llama.cpp server (Qwen 2.5 7B)
- **RAG context**: ChromaDB + Sentence-Transformers (all-MiniLM-L6-v2) for campus knowledge retrieval
- **Fallback strategy**: Local LLM → (optional) remote fallback → mock response
- **Lazy initialization**: LLM client created only on first request

### Production Deployment (docker-compose.prod.yml)
- **llama.cpp server**: GPU-accelerated inference (Qwen 2.5 7B, 4096 context, flash attention)
- **Prometheus**: Metrics scraping from API
- **Grafana**: Dashboard visualization

---

## 11. Key Entry Points

| Entry Point | File | Description |
|-------------|------|-------------|
| Frontend | `apps/web/main.tsx` | React root render |
| Frontend App | `apps/web/App.tsx` | Root component, global keyboard, all overlays |
| 3D Scene | `apps/web/src/components/Scene3D.tsx` | R3F Canvas, physics, lighting |
| Player Control | `apps/web/src/components/PlayerController.tsx` | Per-frame movement/physics loop |
| World Render | `apps/web/src/components/architecture/CampusMap.tsx` | Zone-based world rendering |
| API Server | `apps/api/src/server.ts` | Express listen + DB connect |
| API App | `apps/api/src/app.ts` | Express route mounting |
| AI Service | `apps/ai-service/app/main.py` | FastAPI app with router mounting |
| Dev Startup | `npm run dev` (root) | concurrently: web + api + ai |

---

## 12. Known Issues & Technical Debt

| Issue | Location | Severity |
|-------|----------|----------|
| `server.ts` calls `app.listen()` twice (once before and once after `connectDB()`) | `apps/api/src/server.ts` | Medium |
| `models/player.ts` is a duplicate/legacy router not mounted anywhere | `apps/api/src/models/player.ts` | Low (dead code) |
| `packages/game-data/src/maps/*` is unused by web (web uses its own `data/maps/`) | `packages/game-data` | Low (confusing) |
| `scripts/check-health.mjs` port numbers were fixed but web health endpoint may not exist | `scripts/` | Low |
| No automated test suite exists | Project-wide | High |
| AI service `app/api/*` routers are now properly mounted in `main.py` | `apps/ai-service` | ✅ Fixed |
| `schemas/dialogue.py` `from typing import list` issue | `apps/ai-service` | ✅ Fixed (now uses `list[str]` built-in) |
| Auth middleware exists but is only used on `batch-sync` endpoint | `apps/api` | Medium |
| Rate limiters defined but not applied to routes | `apps/api/src/middleware/rateLimit.ts` | Medium |

---

## 13. Configuration Files

| File | Purpose |
|------|---------|
| `package.json` (root) | Workspace definitions, dev scripts |
| `apps/web/package.json` | Frontend dependencies |
| `apps/web/vite.config.ts` | Vite build config, proxy, vendor chunks |
| `apps/web/tailwind.config.js` | Tailwind CSS configuration |
| `apps/api/package.json` | Backend dependencies |
| `apps/api/tsconfig.json` | TypeScript config for API |
| `apps/ai-service/requirements.txt` | Python dependencies |
| `packages/game-data/package.json` | Game data package config |
| `packages/shared-types/package.json` | Shared types package config |
| `.env.example` | Environment variable template |
| `docker-compose.dev.yml` | Dev Docker Compose |
| `docker-compose.prod.yml` | Production Docker Compose |
| `docker/mongodb/init.js` | MongoDB index initialization |

---

## 14. Interaction Model (Unified)

All interactable objects share the same pattern via `useInteraction` hook:

```
useInteraction({ targetPosition, radius, onEnter, onExit }) → boolean
  → Enter range: show "[E] ..." prompt (InteractionPrompt)
  → In range + keydown 'e': execute action
```

| Interactable | Action | Component |
|-------------|--------|-----------|
| Zone Portal | Zone transition | `ZonePortal.tsx` |
| Town Building | Enter generated interior | `TownBuilding.tsx` |
| Bus Stop | Open fast-travel menu | `BusStop.tsx` |
| NPC | Open dialogue | `NpcCharacter.tsx` |
| Quest Trigger | Open mini-game | `QuestTrigger.tsx` |
| Pickup Item | Add to inventory | `PickupItem.tsx` |
| Event Marker | Resolve event for reward | `EventMarker.tsx` |
| Interior Exit | Exit building to outdoor | `InteriorExitPortal.tsx` |

---

## 15. Persistence Strategy

| Data | Storage | Mechanism |
|------|---------|-----------|
| Player position/rotation | MongoDB | PATCH `/api/player/:id/state` (throttled) |
| Inventory | localStorage | Zustand persist (`cq-inventory`) |
| Friendship | localStorage | Zustand persist (`cq-friendship`) |
| Exploration (chunks) | localStorage | Zustand persist (`cq-exploration`) |
| Collectibles | localStorage | Zustand persist (`cq-collectibles`) |
| Fast-travel unlocks | localStorage | Zustand persist (`cq-travel`) |
| Quests | Memory only | Transient Zustand store |
| Clock/phase | Memory only | Transient Zustand store |
| Dialogue | Memory only | Transient Zustand store |
| Events | Memory only | Transient Zustand store |

---

*This map was generated by automated repository scanning. Some inferences were made where code comments or naming were ambiguous. All source code, comments, and file names are in English per project convention.*
