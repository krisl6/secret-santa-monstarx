import { ConvexHttpClient } from "convex/browser";
import type { Id } from "../convex/_generated/dataModel";

// This will be set when Convex is deployed
const CONVEX_URL = process.env.CONVEX_URL || "";

if (!CONVEX_URL) {
  console.warn("CONVEX_URL not set. Convex operations will fail.");
}

export const convexClient = new ConvexHttpClient(CONVEX_URL);

// Re-export types for convenience
export type { Id };

