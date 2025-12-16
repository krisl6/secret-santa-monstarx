import { supabase, generateInviteCode } from './supabase';
import type {
    Team,
    TeamMember,
    Wishlist,
    WishlistItem,
    Assignment,
    Profile,
    Currency,
    TeamWithMembers,
    AssignmentWithDetails
} from './types';

// ============= TEAMS =============

export async function createTeam(data: {
    name: string;
    ownerId: string;
    budgetMin: number;
    budgetMax: number;
    currency: Currency;
    exchangeDate?: string | null;
}): Promise<Team> {
    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let isUnique = false;

    while (!isUnique) {
        const { data: existing } = await supabase
            .from('teams')
            .select('id')
            .eq('invite_code', inviteCode)
            .single();

        if (!existing) {
            isUnique = true;
        } else {
            inviteCode = generateInviteCode();
        }
    }

    const { data: team, error } = await supabase
        .from('teams')
        .insert({
            name: data.name,
            owner_id: data.ownerId,
            budget_min: data.budgetMin,
            budget_max: data.budgetMax,
            currency: data.currency,
            invite_code: inviteCode,
            exchange_date: data.exchangeDate || null,
        })
        .select()
        .single();

    if (error) throw error;

    // Auto-add owner as member
    await addTeamMember(team.id, data.ownerId);

    return team;
}

export async function getTeam(teamId: string): Promise<Team | null> {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getTeamByInviteCode(inviteCode: string): Promise<Team | null> {
    const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function getUserTeams(userId: string): Promise<Team[]> {
    const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams(*)')
        .eq('user_id', userId);

    if (error) throw error;

    return data?.map((tm: any) => tm.teams).filter(Boolean) || [];
}

export async function getTeamWithMembers(teamId: string): Promise<TeamWithMembers | null> {
    const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

    if (teamError) {
        if (teamError.code === 'PGRST116') return null;
        throw teamError;
    }

    const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*, profile:profiles(*)')
        .eq('team_id', teamId);

    if (membersError) throw membersError;

    return {
        ...team,
        members: members || [],
    };
}

// ============= TEAM MEMBERS =============

export async function addTeamMember(teamId: string, userId: string): Promise<TeamMember> {
    const { data, error } = await supabase
        .from('team_members')
        .insert({ team_id: teamId, user_id: userId })
        .select()
        .single();

    if (error) {
        // Already a member - that's fine
        if (error.code === '23505') {
            const { data: existing } = await supabase
                .from('team_members')
                .select('*')
                .eq('team_id', teamId)
                .eq('user_id', userId)
                .single();
            return existing!;
        }
        throw error;
    }
    return data;
}

export async function getTeamMembers(teamId: string): Promise<(TeamMember & { profile: Profile })[]> {
    const { data, error } = await supabase
        .from('team_members')
        .select('*, profile:profiles(*)')
        .eq('team_id', teamId);

    if (error) throw error;
    return data || [];
}

export async function isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

    return !!data;
}

// ============= WISHLISTS =============

export async function upsertWishlist(
    teamId: string,
    userId: string,
    items: WishlistItem[]
): Promise<Wishlist> {
    // Limit to 3 items
    const limitedItems = items.slice(0, 3);

    const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

    if (existing) {
        const { data, error } = await supabase
            .from('wishlists')
            .update({ items: limitedItems, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from('wishlists')
            .insert({ team_id: teamId, user_id: userId, items: limitedItems })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
}

export async function getWishlist(teamId: string, userId: string): Promise<Wishlist | null> {
    const { data, error } = await supabase
        .from('wishlists')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

// ============= ASSIGNMENTS =============

export async function createAssignments(
    teamId: string,
    ownerId: string,
    assignments: { giverId: string; receiverId: string }[]
): Promise<Assignment[]> {
    // Verify caller is owner
    const team = await getTeam(teamId);
    if (!team || team.owner_id !== ownerId) {
        throw new Error('Only team owner can create assignments');
    }

    // Clear existing assignments
    await supabase.from('assignments').delete().eq('team_id', teamId);

    // Insert new assignments
    const { data, error } = await supabase
        .from('assignments')
        .insert(
            assignments.map(a => ({
                team_id: teamId,
                giver_id: a.giverId,
                receiver_id: a.receiverId,
            }))
        )
        .select();

    if (error) throw error;
    return data || [];
}

export async function getAssignment(teamId: string, giverId: string): Promise<AssignmentWithDetails | null> {
    const { data: assignment, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('team_id', teamId)
        .eq('giver_id', giverId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }

    // Get receiver profile
    const { data: receiver } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', assignment.receiver_id)
        .single();

    // Get receiver's wishlist
    const wishlist = await getWishlist(teamId, assignment.receiver_id);

    return {
        ...assignment,
        receiver: receiver!,
        wishlist,
    };
}

export async function hasAssignments(teamId: string): Promise<boolean> {
    const { data } = await supabase
        .from('assignments')
        .select('id')
        .eq('team_id', teamId)
        .limit(1);

    return (data?.length || 0) > 0;
}

// ============= PROFILES =============

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data;
}

export async function updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>>
): Promise<Profile> {
    const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}
