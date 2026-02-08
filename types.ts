
export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR'
}

export enum TaskType {
  QURAN = 'QURAN', // Pages
  RISALE = 'RISALE', // Pages
  PIRLANTA = 'PIRLANTA', // Pages
  ZIKIR = 'ZIKIR', // Count
  BOOK_READING = 'BOOK_READING', // Pages
  NAMAZ = 'NAMAZ' // Count (Rekat or Vakit)
}

export interface LogEntry {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  type: TaskType;
  value: number; // pages or count
  details?: string; // Optional notes
  isVerified?: boolean; // Mentor approval status
}

export interface CustomTask {
  id: string;
  title: string; // e.g. "Teheccüd Namazı"
  targetDescription: string; // e.g. "2 Rekat"
  type: TaskType;
}

export interface InventoryItem {
  id: string;
  type: 'STREAK_FREEZE' | 'AVATAR';
  count: number;
}

export interface TemporaryReward {
  id: 'RAINBOW_NAME' | 'NEON_FRAME' | 'GOLD_GLOW';
  expiresAt: string; // ISO Date String
  isActive?: boolean; // User can toggle visibility
}

export interface Student {
  id: string;
  name: string;
  username?: string; // Added for login
  avatarUrl: string;
  role: UserRole.STUDENT;
  streak: number; // Current day streak
  totalXp: number;
  coins: number; // Currency for shop
  level: number;
  groupId: string;
  logs: LogEntry[];
  badges: string[];
  customTasks: CustomTask[]; // Assigned by mentor
  inventory: InventoryItem[];
  activeRewards: TemporaryReward[]; // Temporary cosmetic upgrades
}

export interface Mentor {
  id: string;
  name: string;
  username?: string; // Added for settings/login consistency
  role: UserRole.MENTOR;
  groupIds: string[];
  avatarUrl?: string; // Optional avatar for mentors
}

export interface Group {
  id: string;
  name: string;
  mentorId: string;
  joinCode: string; // Unique code for students to join
}

// For the UI state
export type CurrentUser = Student | Mentor;
