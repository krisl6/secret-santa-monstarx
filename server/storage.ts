import { convexClient, type Id } from "./convexClient";
import { api } from "../convex/_generated/api";
import type {
  Team,
  InsertTeam,
  TeamMember,
  InsertTeamMember,
  Wishlist,
  InsertWishlist,
  Assignment,
  InsertAssignment,
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

// Helper to convert Convex Id to string for compatibility
function idToString(id: Id<"teams">): string {
  return id as unknown as string;
}

// Helper to convert string to Convex Id (with validation)
function stringToId(teamId: string): Id<"teams"> {
  return teamId as unknown as Id<"teams">;
}

class Storage implements IStorage {
  // Team operations
  async createTeam(teamData: InsertTeam): Promise<Team> {
    const teamId = await convexClient.mutation(api.teams.create, {
      name: teamData.name,
      ownerId: teamData.ownerId,
    });
    const team = await convexClient.query(api.teams.get, { teamId });
    if (!team) throw new Error("Failed to create team");
    return {
      id: idToString(teamId),
      name: team.name,
      ownerId: team.ownerId,
      createdAt: new Date(team.createdAt),
    };
  }

  async getTeam(teamId: string): Promise<Team | undefined> {
    const team = await convexClient.query(api.teams.get, { teamId: stringToId(teamId) });
    if (!team) return undefined;
    return {
      id: teamId,
      name: team.name,
      ownerId: team.ownerId,
      createdAt: new Date(team.createdAt),
    };
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const teams = await convexClient.query(api.teams.getUserTeams, { userId });
    return teams.map((team: any) => ({
      id: idToString(team._id),
      name: team.name,
      ownerId: team.ownerId,
      createdAt: new Date(team.createdAt),
    }));
  }

  // Team member operations
  async addTeamMember(memberData: InsertTeamMember): Promise<TeamMember> {
    const memberId = await convexClient.mutation(api.teamMembers.add, {
      teamId: stringToId(memberData.teamId),
      userId: memberData.userId,
    });
    const members = await convexClient.query(api.teamMembers.getByTeam, {
      teamId: stringToId(memberData.teamId),
    });
    const member = members.find((m: any) => m.userId === memberData.userId);
    if (!member) throw new Error("Failed to add team member");
    return {
      id: idToString(memberId),
      teamId: memberData.teamId,
      userId: member.userId,
      joinedAt: new Date(member.joinedAt),
    };
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const members = await convexClient.query(api.teamMembers.getByTeam, {
      teamId: stringToId(teamId),
    });
    return members.map((member: any) => ({
      id: idToString(member._id),
      teamId,
      userId: member.userId,
      joinedAt: new Date(member.joinedAt),
    }));
  }

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    return await convexClient.query(api.teamMembers.isMember, {
      teamId: stringToId(teamId),
      userId,
    });
  }

  // Wishlist operations
  async upsertWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const wishlistId = await convexClient.mutation(api.wishlists.upsert, {
      teamId: stringToId(wishlistData.teamId),
      userId: wishlistData.userId,
      brand: wishlistData.brand,
      item: wishlistData.item,
    });
    const wishlist = await convexClient.query(api.wishlists.get, {
      teamId: stringToId(wishlistData.teamId),
      userId: wishlistData.userId,
    });
    if (!wishlist) throw new Error("Failed to upsert wishlist");
    return {
      id: idToString(wishlistId),
      teamId: wishlistData.teamId,
      userId: wishlist.userId,
      brand: wishlist.brand || undefined,
      item: wishlist.item || undefined,
      createdAt: new Date(wishlist.createdAt),
      updatedAt: new Date(wishlist.updatedAt),
    };
  }

  async getWishlist(teamId: string, userId: string): Promise<Wishlist | undefined> {
    const wishlist = await convexClient.query(api.wishlists.get, {
      teamId: stringToId(teamId),
      userId,
    });
    if (!wishlist) return undefined;
    return {
      id: idToString(wishlist._id),
      teamId,
      userId: wishlist.userId,
      brand: wishlist.brand || undefined,
      item: wishlist.item || undefined,
      createdAt: new Date(wishlist.createdAt),
      updatedAt: new Date(wishlist.updatedAt),
    };
  }

  async getAllWishlists(teamId: string): Promise<Wishlist[]> {
    const wishlists = await convexClient.query(api.wishlists.getByTeam, {
      teamId: stringToId(teamId),
    });
    return wishlists.map((wishlist: any) => ({
      id: idToString(wishlist._id),
      teamId,
      userId: wishlist.userId,
      brand: wishlist.brand || undefined,
      item: wishlist.item || undefined,
      createdAt: new Date(wishlist.createdAt),
      updatedAt: new Date(wishlist.updatedAt),
    }));
  }

  // Assignment operations
  async createAssignments(teamId: string, assignmentList: InsertAssignment[]): Promise<Assignment[]> {
    const assignmentIds = await convexClient.mutation(api.assignments.create, {
      teamId: stringToId(teamId),
      assignments: assignmentList.map((a) => ({
        giverId: a.giverId,
        receiverId: a.receiverId,
      })),
    });
    // Fetch the created assignments
    const assignments = await Promise.all(
      assignmentList.map(async (a) => {
        const assignment = await convexClient.query(api.assignments.get, {
          teamId: stringToId(teamId),
          giverId: a.giverId,
        });
        if (!assignment) throw new Error("Failed to create assignment");
        return {
          id: idToString(assignment._id),
          teamId,
          giverId: assignment.giverId,
          receiverId: assignment.receiverId,
          createdAt: new Date(assignment.createdAt),
        };
      })
    );
    return assignments;
  }

  async getAssignment(teamId: string, giverId: string): Promise<Assignment | undefined> {
    const assignment = await convexClient.query(api.assignments.get, {
      teamId: stringToId(teamId),
      giverId,
    });
    if (!assignment) return undefined;
    return {
      id: idToString(assignment._id),
      teamId,
      giverId: assignment.giverId,
      receiverId: assignment.receiverId,
      createdAt: new Date(assignment.createdAt),
    };
  }

  async hasAssignments(teamId: string): Promise<boolean> {
    return await convexClient.query(api.assignments.hasAssignments, {
      teamId: stringToId(teamId),
    });
  }

  async clearAssignments(teamId: string): Promise<void> {
    // Clear is handled in createAssignments mutation
    // This is a no-op for Convex since createAssignments already clears
  }
}

export const storage = new Storage();
