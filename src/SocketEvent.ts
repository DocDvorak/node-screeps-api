import { Api } from './Api'

/**
 * Base format of any message that can be sent by the server
 * over a WebSocket connection.
 */
export interface SocketEvent {
  id: string
  path: string
  /**
   * An identifier for the type of event this object describes.
   *
   * The following is a non-exhaustive list of possible values:
   * - `auth`
   * - `connected`
   * - `console`
   * - `disconnected`
   * - `message`
   * - `package`
   * - `protocol`
   * - `server`
   * - `subscribe`
   * - `time`
   * - `unsubscribe`
   */
  type: string
  /**
   * The event payload.
   *
   * Extensions of this interface should specify a more precise type.
   */
  data: unknown
}

/**
 * WebSocket event for authentication responses.
 */
export interface AuthEvent extends SocketEvent {
  type: 'server'
  path: 'auth'
  data: {
    status: 'ok' | 'failed'
    token: string
  }
}

/**
 * WebSocket event for code changes.
 *
 * When subscribed, the server sends an event with the full updated code base
 * every time the code is changed.
 */
export interface CodeEvent extends SocketEvent {
  path: 'code'
  data: CodeEventData
}

/** Payload of a {@link CodeEvent} */
export interface CodeEventData extends SocketEvent {
  /** Name of the updated branch */
  branch: string
  /** The updated code */
  modules: Api.UserCodeModules
  /** "Last modified" UNIX timestamp (in milliseconds) */
  timestamp: number
  /** A hash of the code base. The hashing algorithm is unknown. */
  hash: number
}

/**
 * WebSocket event for console output.
 *
 * When subscribed, the server sends one event per tick with console logs,
 * return values of commands, etc.
 */
export interface ConsoleEvent extends SocketEvent {
  path: 'console'
  data: ConsoleEventData
}

/** Payload of a {@link ConsoleEvent} */
export interface ConsoleEventData {
  /**
   * Console messages/results from the previous tick.
   * Undefined if no output was produced.
   */
  messages?: ConsoleMessages
  error?: string
}

/** Part of {@link ConsoleEventData} */
export interface ConsoleMessages {
  /** Messages logged via `console.log()` */
  log: string[]
  /**
   * Results of console expressions sent via
   * {@link ScreepsHttpClient.userConsole}
   */
  results: string[]
}

/**
 * WebSocket event for CPU/memory usage updates.
 *
 * When subscribed, the server sends one event per tick (per shard?)
 */
export interface CpuEvent extends SocketEvent {
  path: 'cpu'
  data: CpuEventData
}

/** Payload of a {@link CpuEvent} */
export interface CpuEventData {
  /** CPU used last tick (integer value) */
  cpu: number
  /** Current memory usage (in bytes) */
  memory: number
}

/**
 * WebSocket event for {@link Api.RoomObject | room objects} and other room
 * state updates.
 *
 * When subscribed, the server will send one event per subscribed room
 * per tick with updated {@link RoomEventData}.
 */
export interface RoomEvent extends SocketEvent {
  /** `'message'`? */
  event: string
  /**
   * The name of the room to which this event pertains.
   *
   * On sharded servers: `room:${shardName}/${roomName}`
   * On shardless servers: `room:${roomName}`
   */
  path: string
  data: RoomEventData
}

/** Payload of a {@link RoomEvent} */
export interface RoomEventData {
  /** The current game time (in ticks) */
  gameTime: number
  /** The current game mode (usually `'world'`) */
  info: {
    mode: 'arena' | 'world'
  }
  /**
   * Room objects indexed by ID.
   *
   * **WARNING:** only the first event returns full room object properties.
   * Subsequent events only return the modified properties.
   */
  objects: { [_id: string]: Api.RoomObject }
  /** {@link https://docs.screeps.com/api/#RoomVisual | RoomVisual} data */
  visual: string
}

/**
 * WebSocket event for updates to the alpha map.
 */
export interface RoomMap2Event extends SocketEvent {
  path: 'roomMap2'
  data: RoomMap2EventData
}

/** Payload of a {@link RoomMap2Event} */
export interface RoomMap2EventData {
  /** Wall positions? */
  w: PositionTuple[]
  /** Road positions? */
  r: PositionTuple[]
  pb: PositionTuple[]
  p: PositionTuple[]
  /** Source positions? */
  s: PositionTuple[]
  /** Creep positions? */
  c: PositionTuple[]
  /** Mineral positions? */
  m: PositionTuple[]
  k: PositionTuple[]
  [userId: string]: PositionTuple[]
}

/** A room (global?) position represented as an [X, Y] tuple */
export type PositionTuple = [x: number, y: number]
