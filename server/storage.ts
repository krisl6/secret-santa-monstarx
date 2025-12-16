import { db } from "./db";
import { eq, and } from "drizzle-orm";
import {
  teams,
  teamMembers,
  wishlists,
  assignments,
  type Team,
  type InsertTeam,
  type TeamMember,
  type InsertTeamMember,
  type Wishlist,
  type InsertWishlist,
  type Assignment,
  type InsertAssignment,
} from "@shared/schema";

export interface IStorage {
  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(teamId: string): Promise<Team | undefined>;
  getUserTeams(userId: string): Promise<Team[]>;

  // Team member operations
  addTeamMember(member: InsertTeamMember): Promise<TeamMember>;
  getTeamMembers(teamId: string): Promise<TeamMember[]>;
  isTeamMember(teamId: string, userId: string): Promise<boolean>;

  // Wishlist operations
  upsertWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  getWishlist(teamId: string, userId: string): Promise<Wishlist | undefined>;
  getAllWishlists(teamId: string): Promise<Wishlist[]>;

  // Assignment operations
  createAssignments(teamId: string, assignmentList: InsertAssignment[]): Promise<Assignment[]>;
  getAssignment(teamId: string, giverId: string): Promise<Assignment | undefined>;
  hasAssignments(teamId: string): Promise<boolean>;
  clearAssignments(teamId: string): Promise<void>;
}

class Storage implements IStorage {
  // Team operations
  async createTeam(teamData: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(teamData).returning();
    return team;
  }

  async getTeam(teamId: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, teamId));
    return team;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const result = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, userId));
    
    return result.map((r: any) => r.team);
  }

  // Team member operations
  async addTeamMember(memberData: InsertTeamMember): Promise<TeamMember> {
    const [member] = await db.insert(teamMembers).values(memberData).returning();
    return member;
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
  }

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)));
    return !!member;
  }

  // Wishlist operations
  async upsertWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const [wishlist] = await db
      .insert(wishlists)
      .values(wishlistData)
      .onConflictDoUpdate({
        target: [wishlists.teamId, wishlists.userId],
        set: {
          brand: wishlistData.brand,
          item: wishlistData.item,
          updatedAt: new Date(),
        },
      })
      .returning();
    return wishlist;
  }

  async getWishlist(teamId: string, userId: string): Promise<Wishlist | undefined> {
    const [wishlist] = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.teamId, teamId), eq(wishlists.userId, userId)));
    return wishlist;
  }

  async getAllWishlists(teamId: string): Promise<Wishlist[]> {
    return await db.select().from(wishlists).where(eq(wishlists.teamId, teamId));
  }

  // Assignment operations
  async createAssignments(teamId: string, assignmentList: InsertAssignment[]): Promise<Assignment[]> {
    // First clear existing assignments
    await this.clearAssignments(teamId);
    
    // Insert new assignments
    const result = await db.insert(assignments).values(assignmentList).returning();
    return result;
  }

  async getAssignment(teamId: string, giverId: string): Promise<Assignment | undefined> {
    const [assignment] = await db
      .select()
      .from(assignments)
      .where(and(eq(assignments.teamId, teamId), eq(assignments.giverId, giverId)));
    return assignment;
  }

  async hasAssignments(teamId: string): Promise<boolean> {
    const [assignment] = await db.select().from(assignments).where(eq(assignments.teamId, teamId)).limit(1);
    return !!assignment;
  }

  async clearAssignments(teamId: string): Promise<void> {
    await db.delete(assignments).where(eq(assignments.teamId, teamId));
  }
}

export const storage = new Storage();
