import type { Store } from "express-session";
import { convexClient } from "../../convexClient";
import { api } from "../../../convex/_generated/api";

export class ConvexSessionStore extends Store {
  async get(sid: string, callback: (err?: any, session?: any) => void) {
    try {
      const session = await convexClient.query(api.sessions.get, { sid });
      if (!session) {
        return callback();
      }
      // Check if expired
      if (session.expire < Date.now()) {
        await convexClient.mutation(api.sessions.destroy, { sid });
        return callback();
      }
      callback(undefined, session.sess);
    } catch (err) {
      callback(err);
    }
  }

  async set(sid: string, session: any, callback?: (err?: any) => void) {
    try {
      const ttl = 7 * 24 * 60 * 60 * 1000; // 1 week
      const expire = Date.now() + ttl;
      await convexClient.mutation(api.sessions.set, {
        sid,
        sess: session,
        expire,
      });
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  async destroy(sid: string, callback?: (err?: any) => void) {
    try {
      await convexClient.mutation(api.sessions.destroy, { sid });
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }

  async touch(sid: string, session: any, callback?: (err?: any) => void) {
    // Update the session with new expire time
    await this.set(sid, session, callback);
  }

  async all(callback: (err?: any, obj?: any) => void) {
    // Not typically needed, but implement for completeness
    callback(new Error("Not implemented"));
  }

  async length(callback: (err?: any, length?: number) => void) {
    // Not typically needed, but implement for completeness
    callback(new Error("Not implemented"));
  }

  async clear(callback?: (err?: any) => void) {
    // Clear expired sessions
    try {
      await convexClient.mutation(api.sessions.clearExpired);
      callback?.();
    } catch (err) {
      callback?.(err);
    }
  }
}

