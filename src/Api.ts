/** Namespace for all public `node-screeps-api` types */
export namespace Api {
  /**
   * Body of a HTTP API success response.
   *
   * Almost all {@link ScreepsHttpClient} endpoint methods will return a
   * response that extends this type. Any non-conforming responses will
   * be of type {@link ErrorResponse}.
   * @see {@link ScreepsApiError} for the error type thrown by endpoint methods
   */
  export interface Response {
    /** An API success response always contains `{ ok: 1 }` */
    ok: 1
  }

  /**
   * Response returned by some endpoints when an issue occurs.
   * Despite the name and fields of this type, this is returned with
   * an HTTP 200 status, and {@link ScreepsHttpClient} does not throw this
   * as an error.
   * @see {@link Response} for the standard success response
   * @see {@link ScreepsApiError} for the error type thrown by endpoint methods
   */
  export interface ErrorResponse extends Response {
    error: string
  }

  /**
   * Body of an HTTP API success response that has not been typed yet.
   * Please consider submitting a PR to replace this with a defined type
   * if you have a sample response body!
   */
  export interface UnknownResponse extends Response {
    [propertyName: string]: unknown
  }

  /** `GET /api/version` response */
  export interface VersionResponse extends Response {
    /** Client version number; undefined on non-official servers */
    package?: number
    protocol: number
    databaseVersion?: number
    serverData: {
      customObjectTypes: object
      /** Number of ticks in each complete history file/chunk */
      historyChunkSize: number
      renderer: {
        resources: object
        metadata: object
      }
      features: {
        name: string
        version: number
        menuItems: {
          section: number
          start?: number
          after?: string
          module?: string
          item: object
        }[]
      }[]
      shards: string[]
      /** socket update rate; undefined on official servers */
      socketUpdateThrottle?: number
      /** welcome message that will be displayed upon signin */
      welcomeText?: string
    }
    /**
     * Name of the current season (usually the season number as a string);
     * undefined on unofficial servers
     */
    currentSeason?: string
    /** undefined on unofficial servers */
    decorationConvertationCost?: number
    /** undefined on unofficial servers */
    decorationPixelizationCost?: number
    /** undefined on official servers */
    useNativeAuth?: boolean
    /** Sum of the number of active players on each shard */
    users: number
  }

  /** `GET /api/authmod` response */
  export type AuthModResponse = OfficialAuthModResponse | UnofficialAuthModResponse

  export interface OfficialAuthModResponse extends Response {
    name: 'official'
  }

  export interface UnofficialAuthModResponse extends Response {
    allowRegistration: boolean
    github: boolean
    gitlab: boolean
    /** Name of the authmod being used (ex: 'screepsmod-auth') */
    name: string
    steam: boolean
    /** Semantic version number of the mod */
    version: string
  }

  /** `GET /api/room-history` response: a room history JSON file */
  export interface RoomHistoryResponse extends Response {
    /** UNIX timestamp (UTC) indicating the time at the start of the chunk */
    timestamp: number
    /** Room name */
    room: string
    /** Number of the first tick in this chunk */
    base: number
    /** History data indexed by tick */
    ticks: { [tick: number]: HistoryTick }
  }

  /** Data from a single tick in a {@link RoomHistoryResponse} */
  export interface HistoryTick {
    [id: string]: RoomObject
  }

  /** `POST /api/servers/list` response: a curated list of community-run servers */
  export interface ServerListResponse extends Response {
    servers: Server[]
  }

  /** A server from {@link ServerListResponse} */
  export interface Server {
    _id: string
    settings: {
      host: string
      port: string
      pass: string
    }
    name: string
    /** Usually 'active' */
    status: string
    likeCount: number
  }

  /** `POST /api/auth/signin` response */
  export interface AuthSigninResponse extends Response {
    token: string
  }

  /** `GET /api/auth/me` response */
  export interface AuthMeResponse extends Response {
    _id: string
    badge?: Badge
    /** Total available CPU per tick */
    cpu?: number
    /** Result of `Game.cpu.shardLimits` */
    cpuShard?: CpuShardLimits
    /** UNIX timestamp of last successful call to `Game.cpu.setShardLimits()` */
    cpuShardUpdatedTime?: number
    /** @deprecated this appears to always be 0; use {@link money} instead */
    credits: string
    email: string
    /** Lifetime control points earned by this player */
    gcl?: number
    /** Github SSO account data */
    github?: {
      id: string
      username: string
    }
    /** UNIX timestamp of the player's last (re)spawn */
    lastRespawnDate?: number
    lastTweetTime?: number
    /** Player's current credit balance; use this instead of {@link credits} */
    money: number
    notifyPrefs: {
      sendOnline?: boolean
      errorsInterval?: boolean
      disabledOnMessages?: boolean
      disabled?: boolean
      interval?: unknown
    }
    /** True if password authentication is configured */
    password?: boolean
    /** Lifetime power processed by this player */
    power?: number
    /**
     * Number of remaining power creep experimentation periods:
     * https://docs.screeps.com/power.html#Power-Creeps
     */
    powerExperimentations: number
    /**
     * UNIX timestamp of the start of player's most recently used power creep
     * experimentation period: https://docs.screeps.com/power.html#Power-Creeps
     */
    powerExperimentationTime?: number
    /** Intrashard / account-bound resource types and amounts owned */
    resources: { [resType in IntershardResourceConstant]: number | undefined; }
    restrictedAccessUntil: unknown
    /** Steam SSO account data */
    steam?: {
      id: string
      displayName: string
      steamProfileLinkHidden?: 0 | 1
    }
    /** Twitter SSO account data */
    twitter?: {
      username: string
      followers_count: number
    }
    username: string
  }

  /** `GET /api/auth/query-token` response */
  export interface AuthQueryTokenResponse extends Response {
    _id: string
    token: TokenInfo
  }

  export interface TokenInfo {
    /**
     * If true, this token can be used to authenticate to all API endpoints.
     * If false, {@link endpoints} and {@link websockets} will be defined.
     */
    full: boolean
    /** List of permitted REST API endpoints (ex: `GET /api/user/name`) */
    endpoints?: string[]
    /** List of permitted websocket endpoints (ex: `WebSockets (console)`) */
    websockets?: string[]
    /** The token supplied with the request */
    token: string
    /** The name/description that was provided with the key generation request */
    description?: string
  }

  /** `POST /api/game/map-stats` response */
  export interface GameMapStatsResponse<S extends MapStat> extends Response {
    gameTime: number
    stats: {
      [roomName: string]: GameMapStatsRoom & {
        [P in S]: {
          user: string
          value: number
        }
      }
    }
    users: Users
  }

  export interface GameMapStatsRoom {
    own?: {
      user: string
      level: number
    }
    sign?: Sign
    hardSign?: SystemSign
    status: RoomStatus
  }

  /** A player signature on a room controller */
  export interface Sign {
    user: string
    text: string
    time: number
    datetime: number
  }

  /** A system signature on a room / room controller */
  export interface SystemSign {
    text: string
    time: number
    datetime: number
    endDatetime: number
  }

  /**
   * `POST /api/game/gen-unique-object-name` and
   * `POST /api/game/gen-unique-flag-name` responses
   */
  export interface GameGenUniqueNameResponse extends Response {
    name: string
  }

  /** `POST /api/game/create-construction` response */
  export interface GameCreateConstructionResponse extends Response {
    result: {
      ok: 1
      n: 1
    }
    ops: {
      _id: string
      type: RoomObjectConstant
      room: string
      x: number
      y: number
      structureType: BuildableStructureConstant
      user: string
      progress: number
      progressTotal: number
    }[]
    insertedCount: number
    insertedIds: string[]
  }

  /** `GET /api/game/time` response */
  export interface GameTimeResponse extends Response {
    time: number
  }

  /** `GET /api/game/world-size` response */
  export interface GameWorldSizeResponse extends Response {
    /** Width of this shard's map (in rooms) */
    width: number
    /** Height of this shard's map (in rooms) */
    height: number
  }

  /** `GET /api/game/room-decorations` response */
  export interface GameRoomDecorationsResponse extends Response {
    decorations: Decorations.Instance[]
  }

  /** `GET /api/game/room-objects` response */
  export interface GameRoomObjectsResponse extends Response {
    objects: RoomObject[]
    users: Users
  }

  /**
   * `GET /api/game/room-terrain` response when `encoded` param is
   * defined and non-empty
   */
  export interface GameRoomTerrainEncodedResponse extends Response {
    terrain: {
      0: {
        _id: string
        room: string
        /**
         * Index by y*50+x to find terrain for a position:
         * - 0: plain
         * - 1: wall
         * - 2: swamp
         */
        terrain: string
      }
    }
  }

  /**
   * `GET /api/game/room-terrain` response when `encoded` param
   * is undefined|null|''
   */
  export interface GameRoomTerrainUnencodedResponse extends Response {
    /** Unlisted positions are of type `plain` */
    terrain: {
      room: string
      x: number
      y: number
      type: 'swamp' | 'wall'
    }[]
  }

  /** `GET /api/game/room-status` response */
  export interface GameRoomStatusResponse extends Response {
    /** The room name */
    _id: string
    /** UNIX timestamp of time this room stopped / will stop being a novice area */
    novice?: number
    /** UNIX timestamp of time this room stopped / will stop being a respawn area */
    respawn?: number
    /** UNIX timestamp of time this room left the 'closed' status */
    openTime?: number
    status: RoomStatus
  }

  /** `GET /api/game/room-overview` response */
  export interface GameRoomOverviewResponse extends Response {
    owner: {
      badge: Badge
      username: string
    } | null
    stats: {
      /**
       * Each stat contains an 8-element array listing stat values
       * for each time slot (least recent to most recent)
       */
      [statId in RoomStat]: {
        value: number
        /**
         * Monotonically increasing integers that do not correspond
         * to game time or UNIX timestamps
         */
        endTime: number
      }[]
    }
    statsMax: { [statMaxId in `${RoomStat}${RoomStatInterval}`]: number }
    /** Total values for each non-zero stat (stats with 0 totals are undefined) */
    totals: { [statId in RoomStat]: number | undefined }
  }

  /** `GET /api/game/market/orders-index` response */
  export interface GameMarketIndexResponse extends Response {
    list: {
      _id: MarketResourceConstant
      /** Number of open orders */
      count: number
      avgPrice: number
      stdeevPrice: number
    }[]
  }

  /**
   * `GET /api/game/market/my-orders` response
   * Intershard orders will be listed under the `intershard` key
   */
  export type GameMarketMyOrdersResponse = Response & {
    [shardName: string]: Order[]
  }

  /** `GET /api/game/market/orders` response */
  export interface GameMarketOrdersResponse extends Response {
    list: OpenOrder[]
  }

  /** `GET /api/game/market/stats` resonse */
  export interface GameMarketStatsResponse extends Response {
    stats: {
      _id: string
      /** Date to which this stats entry corresponds in YYYY-MM-DD format */
      date: string
      resourceType: MarketResourceConstant
      avgPrice: number
      stddevPrice: number
      volume: number
      transactions: number
    }[]
  }

  /** `GET /api/game/shards/info` response */
  export interface GameShardsInfoResponse extends Response {
    shards: {
      name: string
      cpuLimit: number
      /** Durations of the most recent (30?) ticks in milliseconds */
      lastTicks: number[]
      /** Number of claimable rooms */
      rooms: number
      /** Number of active users */
      users: number
      /** Average tick duration */
      tick: number
    }[]
  }

  /** `GET /api/leaderboard/list` response */
  export interface LeaderboardListResponse extends Response {
    list: LeaderboardResult[]
    /** Total number of results in this season */
    count: number
    users: Users
  }

  /** `GET /api/leaderboard/find` response */
  export interface LeaderboardFindResponse extends Response, LeaderboardResult {}

  /** A user's leaderboard result for a single season */
  export interface LeaderboardResult {
    _id: string
    season: string
    user: string
    score: number
    rank: number
  }

  /** `GET /api/leaderboard/seasons` response */
  export interface LeaderboardSeasonsResponse extends Response {
    seasons: {
      /** YYYY-MM */
      _id: string
      /** ISO 8601 season start timestamp */
      date: string
      /** <Month> <Year> */
      name: string
    }[]
  }

  /**
   * The types of leaderboard available via the leaderboard endpoints
   * (ex: {@link ScreepsHttpClient.leaderboardList}):
   * - 'world': Control Points (as used to earn Global Control Level)
   * - 'power': Power Processed (as used to earn Global Power Level)
   */
  export type LeaderboardType = 'world' | 'power'

  /** `GET /api/seasons/current` response */
  export interface SeasonsCurrentResponse extends Response {
    /** Name of the season (ex: "Season 8") */
    title: string
    /** Your current ranking on the seasonal leaderboard */
    rank: number
    /** The season ordinal (ex: 5 for season 5, 8 for season 8) */
    index: number
    /** Season start date/time (ISO 8601 UTC) */
    startDate: string
    /** Season end date/time (ISO 8601 UTC) */
    endDate: string
    /** Date/time at which this season was published (ISO 8601 UTC) */
    createdAt: string
    /** Date/time at which this season was last updated (ISO 8601 UTC) */
    updatedAt: string
  }

  /** `POST /api/user/notify-prefs` response */
  export interface UserNotifyPrefsRequest {
    disabled: boolean
    disabledOnMessages?: boolean
    sendOnline?: boolean
    interval?: number
    errorsInterval?: number
  }

  /** `GET /api/user/world-start-room` response */
  export interface UserWorldStartRoomResponse extends Response {
    /**
     * Zero or one room names; if a shard name was not included in the request,
     * results are formatted as `${shardName}/${roomName}`
     */
    room: string[]
  }

  /** `GET /api/user/world-status` response */
  export interface UserWorldStatusResponse extends Response {
    /**
     * - Normal: user has one or more active spawns
     * - Lost: user has no active spawns
     * - Empty: user has just entered the world or respawned
     *    and has yet to place a spawn
     */
    status: 'normal' | 'lost' | 'empty'
  }

  /** `GET /api/user/branches` response */
  export interface UserBranchesResponse extends Response {
    list: {
      _id: string
      branch: string
      activeWorld: boolean
      activeSim: boolean
    }[]
  }

  /** `GET /api/user/code` response */
  export interface UserCodeGetResponse extends Response, UserCodeSetRequest {}

  /** `POST /api/user/code` response */
  export interface UserCodeSetRequest {
    /**
     * The name of the branch
     * @see {@link ScreepsHttpClient.userBranches} to list available branches
     */
    branch: string
    /** JavaScript code and WASM binaries keyed by module name */
    modules: UserCodeModules
  }

  /** Describes a collection of code modules */
  export interface UserCodeModules {
    /**
     * JavaScript code or WASM binaries keyed by module name.
     * If the value of a module is a string, it is treated as JavaScript.
     * If the value of a module is an object with a `binary` property,
     * the value of that property is treated as a WASM binary.
     */
    [moduleName: string]: string | { binary: string }
  }

  /** `GET /api/user/decorations/inventory` response */
  export interface UserDecorationInventoryResponse extends Response {
    list: Decorations.Instance[]
  }

  /** `GET /api/user/decorations/themes` response */
  export interface UserDecorationThemesResponse extends Response {
    list: {
      _id: string
      /** Web color format */
      color: string
      name: string
      /** ISO 8601 timestamp */
      createdAt: string
      /** ISO 8601 timestamp */
      updatedAt: string
      /** Appears to always be 0 */
      __v: number
    }[]
  }

  /** `GET /api/user/messages/list` response */
  export interface UserMessagesListResponse extends Response {
    messages: {
      /** ID of the message */
      _id: string
      /** ISO 8601 timestamp */
      date: string
      /** incoming or outgoing */
      type: 'in' | 'out'
      /** Message body */
      text: string
      unread: boolean
    }[]
  }

  /**
   * Message data returned by {@link UserMessagesListResponse},
   * {@link UserMessagesIndexResponse}, etc
   */
  export interface ListMessage {
    /** ID of the message */
    _id: string
    /** ISO 8601 timestamp */
    date: string
    /** incoming or outgoing */
    type: 'in' | 'out'
    /** Message body */
    text: string
    unread: boolean
  }

  /** `GET /api/user/messages/index` response */
  export interface UserMessagesIndexResponse extends Response {
    messages: {
      _id: string
      message: Message
    }[]
    users: Users
  }

  /** Message data returned by {@link UserMessagesIndexResponse} */
  export interface Message extends ListMessage {
    /** ID of the other user */
    respondent: string
    /** ID of the current user */
    user: string
    /** ID of ??? */
    outMessage: string
  }

  /** `GET /api/user/messages/unread-count` response */
  export interface UserMessagesUnreadCountResponse extends Response {
    count: number
  }

  /** `POST /api/user/messages/mark-read` response */
  export interface UserMessagesMarkReadResponse extends Response {
    0: number
    1: number
    2: DbModifiedResult
  }

  /** `GET /api/user/memory` response */
  export interface UserMemoryGetResponse extends Response {
    /** Undefined if the specified memory path does not exist */
    data?: unknown
  }

  /** `POST /api/user/memory` response */
  export interface UserMemorySetResponse extends Response, DbModifiedResponse {
    ops: {
      user: string
      expression: string
      hidden: boolean
    }[]
    data: string
    insertedCount: number
    insertedIds: string[]
  }

  /** `GET /api/user/memory-segment` response */
  export interface UserMemorySegmentGetResponse extends Response {
    /**
     * The contents of the requested {@link https://docs.screeps.com/api/#RawMemory.segments | RawMemory.segments}.
     *
     * If a single segment ID is specified, returns the contents of that segment as a string.
     *
     * If multiple segment IDs are specified, returns the contents of each requested segment as a string array.
     * The order of segment data in this array matches the order of the segment IDs array from the request.
     *
     * `null` will be returned instead of a string for any uninitialized segment.
     */
    data: string | null | (string | null)[]
  }

  /** `GET /api/user/find` response */
  export interface UserFindResponse extends Response {
    user: User & {
      /** Total control points earned by this user */
      gcl: number
      /** Total power processed by this user */
      power?: number
      /** User's linked Steam account (if public) */
      steam?: {
        id: string
      }
    }
  }

  /** `GET /api/user/respawn-prohibited-rooms` response */
  export interface UserRespawnProhibitedRoomsResponse extends Response {
    /**
     * Zero or one room names; results are formatted as `${shardName}/${roomName}`
     */
    rooms: string[]
  }

  /** `GET /api/user/rooms` response */
  export interface UserRoomsResponse extends Response {
    /** All arrays in this object will always be empty */
    reservations: { [shardName: string]: string[] }
    /** Names of all rooms claimed by this user, keyed by shard */
    shards: { [shardName: string]: string[] }
  }

  /** `GET /api/user/stats` response */
  export interface UserStatsResponse extends Response {
    stats: {
      /** The value of each stat over the requested {@link RoomStatInterval} */
      [statId in RoomStat]: number
    }
  }

  /** `GET /api/user/overview` response */
  export interface UserOverviewResponse extends Response {
    statsMax: number
    totals: { [statName in RoomStat]: number }
    shards: {
      [shardName: string]: {
        rooms: string[]
        stats: {
          /**
           * Each room contains an 8-element array listing stat values
           * for each time slot (least recent to most recent)
           */
          [roomName: string]: {
            value: number
            /**
             * Monotonically increasing integers that do not correspond
             * to game time or UNIX timestamps
             */
            endTime: number
          }[]
        }
        /** Shard game time of the beginning of the displayed stat interval */
        gameTimes: [number, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
      }
    }
  }

  /** `GET /api/user/money-history` response */
  export interface UserMoneyHistoryResponse extends Response {
    list: {
      _id: string
      /** ISO 8601 transaction timestamp */
      date: string
      /** Game time of transaction */
      tick?: number
      /** This user's ID */
      user: string
      type: 'market.buy' | 'market.sell' | 'market.fee'
      /** Balance after the transaction was completed */
      balance: number
      /** Credits spent for or earned by this transaction */
      change: number
      shard?: string
      market: MoneyHistoryChangeOrderPrice | MoneyHistoryExtendOrder | MoneyHistoryFillOrder | MoneyHistoryNewOrder
    }[]
    page: number
    /** True if additional pages can be fetched */
    hasMore: boolean
  }

  export interface MoneyHistoryChangeOrderPrice {
    changeOrderPrice: {
      orderId: string
      oldPrice: number
      newPrice: number
    }
  }

  export interface MoneyHistoryExtendOrder {
    extendOrder: {
      orderId: string
      addAmount: number
    }
  }

  export interface MoneyHistoryFillOrder {
    resourceType: MarketResourceConstant
    roomName?: string
    targetRoomName?: string
    /** ID of the user who created the order */
    owner?: string
    /** ID of the user who filled the order */
    dealer?: string
    price: number
    amount: number
    npc?: boolean
  }

  export interface MoneyHistoryNewOrder {
    order: {
      type: 'buy' | 'sell'
      resourceType: MarketResourceConstant
      price: number
      totalAmount: number
      roomName?: string
    }
  }

  /** `POST /api/user/console` response */
  export interface UserConsoleResponse extends Response {
    result: {
      ok: 1
      n: 1
    }
    ops: [{
      _id: string
      user: string
      expression: string
      shard: string
    }]
    insertedCount: 1
    insertedIds: [string]
  }

  /** `GET /api/user/name` response */
  export interface UserNameResponse extends Response {
    username: string
  }

  /** `GET /api/experimental/pvp` response */
  export interface ExperimentalPvpResponse extends Response {
    /** Rooms with current/recent combat activity grouped by shard name */
    pvp: {
      [shardName: string]: {
        /** Rooms sorted in descending order of `lastPvpTime` */
        rooms: {
          /** Name of the room */
          _id: string
          /** Last tick at which a combat action occurred in this room */
          lastPvpTime: number
        }[]
        /** Current game time on this shard */
        time: number
      }
    }
  }

  /** `GET /api/experimental/nukes` response */
  export interface ExperimentalNukesResponse extends Response {
    /** {@link Nuke} objects grouped by shard name */
    nukes: { [shardName: string]: Nuke[] }
  }

  /**
   * Response from `GET /api/warpath/battles` on a game server,
   * or any `GET * /battles.json` endpoints on
   * {@link https://voight-kampff.fly.dev/ | Voight-Kampff}
   */
  export interface WarpathBattlesResponse extends Response {
    /** ISO 8601 time at which the last scan was conducted */
    timestamp: string
    /** A list of conflicts indexed by shard */
    shards: { [shardName: string]: WarpathBattle[] }
  }

  /** An individual battle from a {@link WarpathBattlesResponse} */
  export interface WarpathBattle {
    /** Name of the room in which the battle is/was occurring */
    room: string
    /**
     * Numeric string value from "0" to "5", where "5" is the
     * highest-level conflict: https://screepspl.us/warpath/classifications/
     */
    classification: string
    /** ISO 8601 time at which the conflict was first observed */
    firstseen: string
    /** ISO 8601 time at which the conflict was last observed */
    lastseen: string
    /** Tick at which the conflict was first observed */
    firsttick: number
    /** Tick at which the conflict was last observed */
    lasttick: number
    /** Username(s) of the attacking player(s) */
    attackers: [string, ...string[]]
    /** Username of the defending player */
    defender: string
  }

  /** `GET /api/scoreboard/list` response */
  export interface ScoreboardListResponse extends Response {
    meta: {
      /** The total number of players who have spawned on this season's map */
      length: number
    }
    /** A page of player leaderboard results */
    users: ScoreboardUser[]
  }

  /** A user from {@link ScoreboardListResponse} */
  export interface ScoreboardUser {
    /** A player's username */
    username: string
    badge: Badge
    /**
     * The player's current rank for this season;
     * ties appear to be broken in alphabetical order.
     */
    rank: number
    /**
     * The player's current score for this season;
     * may be undefined if the player hasn't scored anything yet.
     */
    score?: number
  }

  // Common Types

  /**
   * Parameters used to render a player's SVG icon / logo / "bust"
   * (as it is referenced in the client)
   */
  export interface Badge {
    color1: string
    color2: string
    color3: string
    flip: boolean
    param: number
    /**
     * ID number (0-30ish) for a standard badge, or
     * two SVG path strings for premium badges (from decorations)
     */
    type: number | {
      path1: string
      path2: string
    }
    /** Decoration ID of the badge if this is not a standard one */
    decoration?: string
  }

  /**
   * Shard CPU limits returned by `GET /api/auth/me`
   * and accepted by `POST /api/user/cpu-shards`
   */
  export interface CpuShardLimits { [shardName: string]: number | undefined }

  /** Generic API response to a request to update database records */
  export interface DbModifiedResponse extends Response {
    result: DbModifiedResult
  }

  /** MongoDB result output from an update operation */
  export interface DbModifiedResult {
    /** If an error is not raised, this will always be 1 to indicate success */
    ok: 1
    /**
     * Number of records that were modified. For a single-record update:
     * 1 if the record was updated; 0 if it was already in the target state
     */
    nModified: number
    /** Number of records matched by the request parameters */
    n: number
  }

  /** Generic API response to a request to create/update database records */
  export interface DbUpsertedResponse extends Response {
    result: DbUpsertedResult
  }

  /** MongoDB result output from an upsert operation */
  export interface DbUpsertedResult extends DbModifiedResult {
    upserted: {
      _id?: string
      index: number
    }[]
  }

  /** All HTTP methods used for Screeps API endpoints */
  export type HttpMethod = 'GET' | 'POST'

  /** IDs of stats that can be used with the `POST /api/game/map-stats` endpoint */
  export type MapStat
    = | 'owner0'
      | 'claim0'
      | RoomStat

  /** IDs of room-level stats that can be viewed in a room/player overview */
  export type RoomStat
    = | 'creepsLost'
      | 'creepsProduced'
      | 'energyConstruction'
      | 'energyControl'
      | 'energyCreeps'
      | 'energyHarvested'
      | 'powerProcessed'

  export type RoomStatInterval = 8 | 180 | 1440

  /** @see https://docs.screeps.com/api/#Game.map.getRoomStatus */
  export type RoomStatus
    = | 'closed'
      | 'normal'
      | 'novice'
      | 'respawn'

  /** High-level metadata for an individual user */
  export interface User {
    _id: string
    username: string
    badge: Badge
  }

  /** A collection of user metadata keyed by user ID */
  export interface Users { [userId: string]: User }

  export interface RoomObject extends _HasEffects, _HasPosition {
    _id: string
    type: RoomObjectConstant
    room: string
    name?: string
  }

  export type RoomObjectConstant
    = | 'constructionSite'
      | 'creep'
      | 'deposit'
      | 'mineral'
      | 'nuke'
      | 'powerCreep'
      | 'source'
      | 'ruin'
      | 'tombstone'
      | StructureConstant
      | ResourceConstant

  export type BuildableStructureConstant
    = | 'constructedWall'
      | 'container'
      | 'controller'
      | 'extension'
      | 'extractor'
      | 'factory'
      | 'lab'
      | 'link'
      | 'nuker'
      | 'observer'
      | 'powerSpawn'
      | 'rampart'
      | 'road'
      | 'spawn'
      | 'storage'
      | 'terminal'
      | 'tower'

  export type StructureConstant
    = | BuildableStructureConstant
      | 'invaderCore'
      | 'keeperLair'
      | 'portal'
      | 'powerBank'

  // Creeps

  export interface AnyCreep extends RoomObject, _HasHits, _HasOwner, _HasStore {
    type: 'creep' | 'powerCreep'
    name: string
    /** Tick at which this creep will expire */
    ageTime: number
  }

  export interface Creep extends AnyCreep {
    type: 'creep'
    actionLog: {
      attack: _HasPosition | null
      attacked: unknown
      build: _HasPosition | null
      harvest: _HasPosition | null
      heal: _HasPosition | null
      healed: unknown
      rangedAttack: _HasPosition | null
      rangedHeal: _HasPosition | null
      rangedMassAttack: unknown
      repair: _HasPosition | null
      reserveController: _HasPosition | null
      say: SayAction | null
      upgradeController: _HasPosition | null
    }
    body: {
      name: BodyPartConstant
      hits: number
      $name: string
      boost?: MineralBoostConstant
    }[]
    fatigue: number
  }

  export type BodyPartConstant
    = | 'attack'
      | 'carry'
      | 'claim'
      | 'heal'
      | 'move'
      | 'rangedAttack'
      | 'tough'
      | 'work'

  export interface PowerCreep extends AnyCreep {
    type: 'powerCreep'
    actionLog: {
      attack: _HasPosition | null
      attacked: unknown
      healed: unknown
      power: unknown
      say: SayAction | null
      spawned: unknown
    }
    className: PowerCreepClass
    /** UNIX timestamp after which this power creep will be deleted */
    deleteTime: number | null
    /** UNIX timestamp after which this dead power creep may be spawned again */
    spawnCooldownTime: number | null
    level: number
    powers: {
      [powerId: number]: {
        level: number
        /** Earliest tick at which this power can be used next */
        cooldownTime: number
      }
    }
    shard: string
  }

  export type PowerCreepClass = 'operator'

  // Structures

  export interface Structure extends RoomObject {
    type: StructureConstant
    _isDisabled: boolean
  }

  export interface StructureContainer extends Structure, _HasHits, _HasStore {
    type: 'container'
    /** Tick at which the structure will next take decay damage */
    nextDecayTime: number
  }

  export interface StructureController extends Structure, _HasOwner {
    type: 'controller'
    downgradeTime?: number | null
    level: number
    isPowerEnabled?: boolean
    progress?: number
    progressTotal?: number
    reservation?: {
      /** Tick at which this reservation will end */
      endTime?: number
      /** ID of the user who reserved this controller */
      user: string
    } | null
    safeMode?: number | null
    safeModeAvailable?: number
    safeModeCooldown?: number | null
    sign?: {
      /** UNIX timestamp at which this controller was signed */
      datetime: number
      /** Sign message */
      text: string
      /** Tick at which this controller was signed */
      time: number
      /** ID of the user who signed this controller */
      user: string
    }
    upgradeBlocked?: number | null
  }

  export interface StructureExtension extends Structure, _HasHits, _HasOwner, _HasRestrictedStore<'energy'> {
    type: 'extension'
    off: boolean
  }

  export interface StructureExtractor extends Structure, _HasHits, _HasOwner {
    type: 'extractor'
    cooldown: number
  }

  export interface StructureFactory extends Structure, _HasHits, _HasOwner, _HasStore {
    type: 'extractor'
    actionLog: {
      produce: unknown
    }
    cooldown: number
    cooldownTime: number
  }

  export interface StructureInvaderCore extends Structure, _HasHits, _HasOwner {
    type: 'invaderCore'
    actionLog: {
      attackController: _HasPosition | null
      reserveController: _HasPosition | null
      transferEnergy: unknown
      upgradeController: _HasPosition | null
    }
    /** Tick at which this L1+ core and its stronghold will disappear */
    decayTime?: number
    /** Tick at which this L1+ core and its stronghold will activate */
    deployTime?: number | null
    depositType?: DepositResourceConstant
    level: number
    /** Tick at which this L1+ core will deploy another L0 core */
    nextExpandTime?: number
    population?: {
      [index: number]: {
        body: string
        behavior: string
      }
    }
    spawning?: unknown
    strongholdBehavior?: string
    strongholdId: string
    templateName?: string
  }

  export interface StructureKeeperLair extends Structure {
    type: 'keeperLair'
    /** Tick at which the next source keeper creep will be spawned from here */
    nextSpawnTime: number | null
  }

  export interface StructureLab extends Structure, _HasHits, _HasOwner, _HasRestrictedStore<'energy' | MineralResourceConstant | MineralCompoundConstant> {
    type: 'lab'
    actionLog: {
      reverseReaction: _HasTwoPositions | null
      runReaction: _HasTwoPositions | null
    }
    cooldown: number
    cooldownTime: number
    mineralAmount: number
  }

  export interface StructureLink extends Structure, _HasHits, _HasOwner, _HasRestrictedStore<'energy'> {
    type: 'link'
    actionLog: {
      transferEnergy: unknown
    }
    cooldown: number
  }

  export interface StructureNuker extends Structure, _HasHits, _HasOwner, _HasRestrictedStore<'energy' | 'G'> {
    type: 'nuker'
    cooldownTime: number
  }

  export interface StructureObserver extends Structure, _HasHits, _HasOwner {
    type: 'observer'
    observeRoom: string | null
  }

  export interface StructurePortal extends Structure {
    type: 'portal'
    destination: {
      room: string
      shard: string
    } | {
      room: string
      x: number
      y: number
    }
    /**
     * UNIX timestamp at which this portal will begin to decay;
     * undefined for intershard portals; null if portal is already decaying
     */
    unstableDate?: number | null
    /**
     * Number of ticks before this portal disappears;
     * undefined if {@link unstableDate} is undefined or null
     */
    decayTime?: number
  }

  export interface StructurePowerBank extends Structure, _HasHits {
    type: 'powerBank'
    /** Tick at which this object will disappear */
    decayTime: number
    store: {
      power: number
    }
  }

  export interface StructurePowerSpawn extends Structure, _HasHits, _HasOwner, _HasRestrictedStore<'energy' | 'power'> {
    type: 'powerSpawn'
  }

  export interface StructureRampart extends Structure, _HasHits, _HasOwner {
    type: 'rampart'
    /** Tick at which the structure will next take decay damage */
    nextDecayTime: number
  }

  export interface StructureRoad extends Structure, _HasHits {
    type: 'road'
    /** Tick at which the structure will next take decay damage */
    nextDecayTime: number
  }

  export interface StructureSpawn extends Structure, _HasHits, _HasOwner, _HasRestrictedStore<'energy'> {
    type: 'spawn'
    off: boolean
    name: string
    spawning?: {
      name: string
      /** Total number of ticks required to spawn this creep */
      needTime: number
      /** Tick at which this creep will finish spawning */
      spawnTime: number
    }
  }

  export interface StructureStorage extends Structure, _HasHits, _HasOwner, _HasStore {
    type: 'storage'
  }

  export interface StructureTerminal extends Structure, _HasHits, _HasOwner, _HasStore {
    type: 'terminal'
    cooldownTime: number
  }

  export interface StructureTower extends Structure, _HasHits, _HasOwner, _HasRestrictedStore<'energy'> {
    type: 'tower'
    actionLog: {
      attack: _HasPosition | null
      heal: _HasPosition | null
      repair: _HasPosition | null
    }
  }

  // Other Objects

  export interface ConstructionSite extends RoomObject {
    type: 'constructionSite'
    name?: string
    progress: number
    progressTotal: number
    structureType: StructureConstant
  }

  export interface Deposit extends RoomObject {
    type: 'deposit'
    /** Tick at which this deposit can be harvested again */
    cooldownTime: number
    /** Tick at which this object will disappear */
    decayTime: number
    depositType: DepositResourceConstant
    /** Amount harvested from this deposit */
    harvested: number
  }

  export interface Mineral extends RoomObject {
    type: 'mineral'
    density: 1 | 2 | 3 | 4
    mineralAmount: number
    mineralType: MineralResourceConstant
    /** Tick at which this resource will be refilled */
    nextRegenerationTime: number
  }

  export interface Nuke extends RoomObject {
    type: 'nuke'
    /** Game time at which this nuke will land */
    landTime: number
    /** Name of the room that launched this nuke */
    launchRoomName: string
  }

  export interface Source extends RoomObject {
    type: 'source'
    energy: number
    energyCapacity: number
    invaderHarvested: number
    /** Tick at which this resource will be refilled */
    nextRegenerationTime: number
    /** @deprecated always set to 300 use {@link nextRegenerationTime} */
    ticksToRegeneration: number
  }

  export interface Ruin extends RoomObject, _HasOwner {
    type: 'ruin'
    /** Tick at which this object will disappear */
    decayTime: number
    /** Tick at which the associated structure was destroyed */
    destroyTime: number
    store: Store
    structure: {
      id: string
      hits: number
      hitsMax: number
      type: StructureConstant
      user: null
    }
  }

  export interface Tombstone extends RoomObject, _HasOwner {
    type: 'tombstone'
    creepBody: BodyPartConstant[]
    creepId: string
    creepName: string
    creepSaying: SayAction | null
    creepTicksToLive: number
    /** Tick at which the associated creep died */
    deathTime: number
    /** Tick at which this object will disappear */
    decayTime: number
    store: Store
  }

  export interface Store {
    [resType: string]: number | undefined
  }

  export type DepositResourceConstant
    = | 'biomass'
      | 'metal'
      | 'silicon'
      | 'mist'

  export type MineralResourceConstant
    = | 'H'
      | 'K'
      | 'L'
      | 'O'
      | 'U'
      | 'X'
      | 'Z'

  export type MineralBoostConstant
    = | 'UH'
      | 'UO'
      | 'KH'
      | 'KO'
      | 'LH'
      | 'LO'
      | 'ZH'
      | 'ZO'
      | 'GH'
      | 'GO'
      | 'UH2O'
      | 'UHO2'
      | 'KH2O'
      | 'KHO2'
      | 'LH2O'
      | 'LHO2'
      | 'ZH2O'
      | 'ZHO2'
      | 'GH2O'
      | 'GHO2'
      | 'XUH2O'
      | 'XUHO2'
      | 'XKH2O'
      | 'XKHO2'
      | 'XLH2O'
      | 'XLHO2'
      | 'XZH2O'
      | 'XZHO2'
      | 'XGH2O'
      | 'XGHO2'

  export type MineralCompoundConstant
    = | 'G'
      | 'OH'
      | 'ZK'
      | 'UL'
      | MineralBoostConstant

  export type ResourceConstant
    = | 'energy'
      | 'power'
      | DepositResourceConstant
      | MineralResourceConstant
      | MineralCompoundConstant
      | 'ops'
      | 'utrium_bar'
      | 'lemergium_bar'
      | 'zynthium_bar'
      | 'keanium_bar'
      | 'ghodium_melt'
      | 'oxidant'
      | 'reductant'
      | 'purifier'
      | 'battery'
      | 'composite'
      | 'crystal'
      | 'liquid'
      | 'wire'
      | 'switch'
      | 'transistor'
      | 'microchip'
      | 'circuit'
      | 'device'
      | 'cell'
      | 'phlegm'
      | 'tissue'
      | 'muscle'
      | 'organoid'
      | 'organism'
      | 'alloy'
      | 'tube'
      | 'fixtures'
      | 'frame'
      | 'hydraulics'
      | 'machine'
      | 'condensate'
      | 'concentrate'
      | 'extract'
      | 'spirit'
      | 'emanation'
      | 'essence'

  export interface SayAction {
    isPublic: boolean
    message: string
  }

  /**
   * Represents an individual order on the in-game market
   * created by the authenticated user
   */
  export interface Order {
    _id: string
    user: string
    active: boolean
    type: 'buy' | 'sell'
    resourceType: MarketResourceConstant
    amount: number
    remainingAmount: number
    totalAmount: number
    price: number
    /** UNIX timestamp at which the order was created */
    createdTimestamp: number
  }

  /** An {@link Order} for a non-account-bound resource */
  export interface ShardOrder extends Order {
    resourceType: ResourceConstant
    roomName: string
    /** Game time at which the order was created */
    created: number
  }

  /** An active order on the in-game market */
  export interface OpenOrder {
    type: 'buy' | 'sell'
    resourceType: MarketResourceConstant
    amount: number
    remainingAmount: number
    price: number
    /**
     * Name of the room that created the order.
     * This is present even for intershard orders,
     * though it is unclear which shard the room is on
     */
    roomName: string
  }

  export type IntershardResourceConstant
    = | 'accessKey'
      | 'cpuUnlock'
      | 'pixel'

  export type MarketResourceConstant = ResourceConstant | IntershardResourceConstant
}

export namespace Decorations {
  /** An instance of a {@link Decoration} that is owned by a user */
  export interface Instance<P extends string = string> {
    _id: string
    user: string
    /**
     * Selected property values for an active decoration (null if inactive)
     * Value type = typeof this['decoration']['props'][key]['default']
     */
    active?: { [key in P]: unknown } | null
    /** The underlying decoration */
    decoration: Badge | Decoration<P>
    /** ISO 8601 timestamp */
    createdAt: string
    /** ISO 8601 timestamp */
    updatedAt?: string
    /** ISO 8601 timestamp */
    activatedAt?: string
    /** ISO 8601 timestamp */
    deactivatedAt?: string
  }

  /** Enumerates all possible types for a {@link Decoration} */
  export type Constant
    = | 'badge'
      | 'creep'
      | 'floorLandscape'
      | 'object'
      | 'wallGraffiti'
      | 'wallLandscape'

  /**
   * Represents a single premium user {@link Api.Badge}.
   * {@link Instance}s of each badge can be earned by users via pixelization.
   */
  export interface Badge extends _Decoration {
    type: 'badge'
    badge: {
      path1: string
      path2: string
    }
  }

  /**
   * Represents a single non-{@link Badge} decoration. {@link Instance}s
   * of each decoration can be earned by users via pixelization.
   */
  export interface Decoration<P extends string> extends _Decoration {
    graphics: ({
      /** Image asset URL (appears to always be an SVG file) */
      url: string
    } & { [key in P]: unknown })[]
    /** Appears to always be a .svg filename */
    description: string
    /**
     * For object decorations; if defined, indicates the type of room object
     * this can be applied to (ex: 'controller')
     */
    objectType?: Api.RoomObjectConstant
    /** Configurable properties of a decoration */
    props: { [key in P]: Property }
    /** For object decorations; indicates whether {@link objectType} is present */
    restricted?: boolean
    type: Exclude<Constant, 'badge'>
  }

  /** A configurable property of a {@link Decoration} */
  export interface Property {
    type: PropertyConstant
    label: boolean
    readonly: boolean
  }

  /** Enumerates all possible {@link Property} types for a {@link Decoration} */
  export type PropertyConstant
    = | 'boolean'
      | 'color'
      | 'number'
      | 'range'
      | 'string'

  /** A configurable boolean property of a {@link Decoration} */
  export interface BooleanProperty extends Property {
    type: 'boolean'
    default: boolean
  }

  /** A configurable color property of a {@link Decoration} */
  export interface ColorProperty extends Property {
    type: 'color'
    /** Web color format */
    default: string
  }

  /** A configurable number property of a {@link Decoration} */
  export interface NumberProperty extends Property {
    type: 'number'
    default: number
  }

  /** A configurable numeric range property of a {@link Decoration} */
  export interface RangeProperty extends Property {
    type: 'range'
    min: number
    max: number
    default: number
  }

  /** A configurable string property of a {@link Decoration} */
  export interface StringProperty extends Property {
    type: 'string'
    default: string
  }
}

/** A {@link Api.RoomObject} that can have temporary effects bestowed on it */
export interface _HasEffects {
  effects?: {
    [index: number]: {
      effect: number
      power: number
      /** Tick at which this effect will end */
      endTime: number
    }
  } | null
}

/** A {@link Api.RoomObject} that can be damaged and destroyed */
export interface _HasHits {
  hits: number
  hitsMax: number
  notifyWhenAttacked: boolean
}

/** A {@link Api.RoomObject} with an owner */
export interface _HasOwner {
  /**
   * ID of the user who owns this object;
   * NPCs do not have long-form hex ID strings like normal players:
   * - Invader: "2"
   * - SourceKeeper: "3"
   */
  user: string
}

export interface _HasPosition {
  x: number
  y: number
}

export interface _HasTwoPositions {
  x1: number
  y1: number
  x2: number
  y2: number
}

/**
 * A {@link Api.RoomObject} with a `store` that can hold any resource type
 * with a limited total capacity
 */
export interface _HasStore {
  store: { [resType in Api.ResourceConstant]: number | undefined }
  storeCapacity: number
}

/**
 * A {@link Api.RoomObject} with a store that can only hold specific resource types;
 * capacities are resource-specific
 */
export interface _HasRestrictedStore<R extends Api.ResourceConstant> {
  store: { [resType in R]: number }
  /**
   * Capacities should not be null, except on minerals in a lab
   * when another mineral type is already being stored.
   */
  storeCapacityResource: { [resType in R]: number | null }
}

/** Properties common to all decoration types */
export interface _Decoration {
  _id: string
  name: string
  /** Whether or not this decoration is being used somewhere */
  enabled?: boolean
  /** Number from 1 (least rare) to 5 (most rare) */
  rarity: number
  rarityMultiplier?: number
  /** Group ID */
  group: string
  groupDescription: string | null
  /** Theme ID */
  theme: string
  /** Preview image asset URLs */
  preview: {
    'original': string
    '128x128': string
    '256x256': string
  }
  steam: number
  steamItemDefId: number
  /** Appears to always be 0 */
  __v: number
}

/**
 * Represents a {@link https://docs.screeps.com/api/#Flag | flag} owned
 * by the authenticated user.
 *
 * While this interface seems to conform to {@link Api.RoomObject}, it is not
 * included in results from {@link ScreepsHttpClient.gameRoomObjects}.
 */
export interface Flag {
  /** Unlike other `_id` fields, values are formatted as `flag_${name}` */
  _id: string
  type: 'flag'
  color: FlagColor
  secondaryColor: FlagColor
  x: number
  y: number
}

/** All available {@link Flag} colors */
export enum FlagColor {
  Red = 1,
  Purple = 2,
  Blue = 3,
  Cyan = 4,
  Green = 5,
  Yellow = 6,
  Orange = 7,
  Brown = 8,
  Grey = 9,
  White = 10
}
