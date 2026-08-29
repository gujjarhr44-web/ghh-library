import { logger } from "./logger";

export type RealtimeEvent =
  | "seat:updated"
  | "attendance:updated"
  | "booking:updated"
  | "payment:updated"
  | "wallet:updated"
  | "stats:updated"
  | "student:updated"
  | "settings:updated";

type RealtimeListener = (event: RealtimeEvent, payload: unknown) => void;
const listeners: RealtimeListener[] = [];

export function onRealtimeEvent(listener: RealtimeListener) {
  listeners.push(listener);
}

export function broadcastRealtime(event: RealtimeEvent, payload: unknown) {
  logger.info({ event, payloadSummary: typeof payload === "object" ? Object.keys(payload as object) : payload }, "Realtime event dispatched");
  for (const listener of listeners) {
    try {
      listener(event, payload);
    } catch (err) {
      logger.error({ err, event }, "Error notifying realtime listener");
    }
  }
}
