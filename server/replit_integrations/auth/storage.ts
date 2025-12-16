import { type User, type UpsertUser } from "@shared/models/auth";
import { convexClient } from "../../convexClient";
import { api } from "../../../convex/_generated/api";

// Interface for auth storage operations
// (IMPORTANT) These user operations are mandatory for Replit Auth.
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await convexClient.query(api.users.get, { id });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
      createdAt: user.createdAt ? new Date(user.createdAt) : null,
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    await convexClient.mutation(api.users.upsert, {
      id: userData.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
    });
    const user = await convexClient.query(api.users.get, { id: userData.id });
    if (!user) throw new Error("Failed to upsert user");
    return {
      id: user.id,
      email: user.email || undefined,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      profileImageUrl: user.profileImageUrl || undefined,
      createdAt: user.createdAt ? new Date(user.createdAt) : null,
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : null,
    };
  }
}

export const authStorage = new AuthStorage();
