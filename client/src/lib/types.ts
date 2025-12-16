// Supabase TypeScript Types for Secret Santa App

export type Currency = 'SGD' | 'JPY' | 'MYR';

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  budget_min: number;
  budget_max: number;
  currency: Currency;
  invite_code: string;
  exchange_date: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  joined_at: string;
}

export interface WishlistItem {
  brand?: string;
  item: string;
  link?: string;
}

export interface Wishlist {
  id: string;
  team_id: string;
  user_id: string;
  items: WishlistItem[];
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: string;
  team_id: string;
  giver_id: string;
  receiver_id: string;
  created_at: string;
}

// Extended types with relations
export interface TeamWithMembers extends Team {
  members: (TeamMember & { profile: Profile })[];
}

export interface AssignmentWithDetails extends Assignment {
  receiver: Profile;
  wishlist: Wishlist | null;
}

// Currency display helpers
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  SGD: 'S$',
  JPY: '¥',
  MYR: 'RM',
};

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'MYR', label: 'MYR (RM)' },
];
