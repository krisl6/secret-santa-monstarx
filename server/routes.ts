import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";
import { insertTeamSchema, insertWishlistSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get user ID from request
  const getUserId = (req: any): string => req.user?.claims?.sub;

  // Create a new team (first person creates the team)
  app.post("/api/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const teamData = insertTeamSchema.parse({ ...req.body, ownerId: userId });
      
      const team = await storage.createTeam(teamData);
      
      // Automatically add creator as a member
      await storage.addTeamMember({ teamId: team.id, userId });
      
      res.json(team);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Join a team via team ID
  app.post("/api/teams/:teamId/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.params;

      // Check if team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Check if already a member
      const isMember = await storage.isTeamMember(teamId, userId);
      if (isMember) {
        return res.status(400).json({ message: "Already a member of this team" });
      }

      await storage.addTeamMember({ teamId, userId });
      res.json({ message: "Joined team successfully", team });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all teams the user belongs to
  app.get("/api/teams", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get team details with members
  app.get("/api/teams/:teamId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.params;

      // Verify user is a member
      const isMember = await storage.isTeamMember(teamId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this team" });
      }

      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }

      const memberIds = await storage.getTeamMembers(teamId);
      
      // Fetch user details for each member
      const members = await Promise.all(
        memberIds.map(async (m) => {
          const user = await authStorage.getUser(m.userId);
          return user;
        })
      );

      res.json({ ...team, members });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Upsert user's wishlist
  app.post("/api/teams/:teamId/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.params;

      // Verify user is a member
      const isMember = await storage.isTeamMember(teamId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this team" });
      }

      const wishlistData = insertWishlistSchema.parse({ ...req.body, teamId, userId });
      const wishlist = await storage.upsertWishlist(wishlistData);
      
      res.json(wishlist);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's own wishlist
  app.get("/api/teams/:teamId/wishlist", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.params;

      const wishlist = await storage.getWishlist(teamId, userId);
      res.json(wishlist || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Draw names (create assignments)
  app.post("/api/teams/:teamId/draw", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.params;

      // Verify user is team owner
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      if (team.ownerId !== userId) {
        return res.status(403).json({ message: "Only team owner can draw names" });
      }

      // Get all team members
      const memberIds = await storage.getTeamMembers(teamId);
      if (memberIds.length < 3) {
        return res.status(400).json({ message: "Need at least 3 members to draw" });
      }

      // Shuffle and create derangement (no one gets themselves)
      let shuffled = [...memberIds];
      let valid = false;
      let attempts = 0;

      while (!valid && attempts < 100) {
        shuffled = [...memberIds].sort(() => Math.random() - 0.5);
        valid = true;
        for (let i = 0; i < memberIds.length; i++) {
          if (memberIds[i].userId === shuffled[i].userId) {
            valid = false;
            break;
          }
        }
        attempts++;
      }

      if (!valid) {
        return res.status(500).json({ message: "Failed to create valid assignment" });
      }

      // Create assignments
      const assignmentList = memberIds.map((member, i) => ({
        teamId,
        giverId: member.userId,
        receiverId: shuffled[i].userId,
      }));

      await storage.createAssignments(teamId, assignmentList);
      res.json({ message: "Assignments created successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's assignment (who they're gifting to)
  app.get("/api/teams/:teamId/assignment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.params;

      // Verify user is a member
      const isMember = await storage.isTeamMember(teamId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this team" });
      }

      const assignment = await storage.getAssignment(teamId, userId);
      if (!assignment) {
        return res.json(null);
      }

      // Get receiver's wishlist and user info
      const wishlist = await storage.getWishlist(teamId, assignment.receiverId);
      const receiver = await authStorage.getUser(assignment.receiverId);

      res.json({
        assignment,
        receiver,
        wishlist,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Check if team has assignments drawn
  app.get("/api/teams/:teamId/has-assignments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { teamId } = req.params;

      // Verify user is a member
      const isMember = await storage.isTeamMember(teamId, userId);
      if (!isMember) {
        return res.status(403).json({ message: "Not a member of this team" });
      }

      const hasAssignments = await storage.hasAssignments(teamId);
      res.json({ hasAssignments });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
