
import { Student, UserRole, TaskType, Group, Mentor } from './types';
import { BookOpen, Moon, Sparkles, Book, Heart, Sunrise, Shield, Medal, Crown, Flame, Zap, Award, TreePine, PenTool, Search, Sun, Hammer, Shovel, Home, Warehouse, Tractor, Library, Landmark } from 'lucide-react';
import React from 'react';

export const XP_RATES = {
  [TaskType.QURAN]: 20, // per page
  [TaskType.RISALE]: 15, // per page
  [TaskType.PIRLANTA]: 15, // per page
  [TaskType.BOOK_READING]: 10, // per page
  [TaskType.ZIKIR]: 0.1, // per count
  [TaskType.NAMAZ]: 50, // per prayer/rekat
};

export const TASK_ICONS = {
  [TaskType.QURAN]: <Moon className="w-8 h-8 text-purple-600" />,
  [TaskType.RISALE]: <Book className="w-8 h-8 text-red-600" />,
  [TaskType.PIRLANTA]: <Sparkles className="w-8 h-8 text-blue-500" />,
  [TaskType.ZIKIR]: <Heart className="w-8 h-8 text-green-500" />,
  [TaskType.BOOK_READING]: <BookOpen className="w-8 h-8 text-orange-500" />,
  [TaskType.NAMAZ]: <Sunrise className="w-8 h-8 text-cyan-600" />
};

export const TASK_LABELS = {
  [TaskType.QURAN]: "Kuran-ı Kerim",
  [TaskType.RISALE]: "Risale-i Nur",
  [TaskType.PIRLANTA]: "Pırlanta Serisi",
  [TaskType.ZIKIR]: "Zikir / Tesbihat",
  [TaskType.BOOK_READING]: "Diğer Okumalar",
  [TaskType.NAMAZ]: "Namaz / İbadet"
};

export const BADGE_ICONS: Record<string, React.ReactElement> = {
  "Erken Kalkan": <Sunrise className="w-4 h-4 text-orange-500" />,
  "Kuran Bülbülü": <Moon className="w-4 h-4 text-purple-500" />,
  "İstikrar Abidesi": <Flame className="w-4 h-4 text-red-500" />,
  "Hafız Namzeti": <Crown className="w-4 h-4 text-yellow-500" />,
  "Kitap Kurdu": <BookOpen className="w-4 h-4 text-blue-500" />,
  "Zikir Üstadı": <Heart className="w-4 h-4 text-green-500" />,
  "Sabah Namazı Fatihi": <Shield className="w-4 h-4 text-indigo-500" />
};

export const RANKS = [
  { name: "Barla Yolcusu", minXp: 0, color: "text-emerald-700", border: "border-emerald-600", icon: <TreePine className="w-3 h-3 md:w-4 md:h-4" /> }, 
  { name: "Nur Şakirdi", minXp: 500, color: "text-blue-700", border: "border-blue-600", icon: <PenTool className="w-3 h-3 md:w-4 md:h-4" /> }, 
  { name: "Müdakkik Okuyucu", minXp: 3000, color: "text-indigo-700", border: "border-indigo-600", icon: <Search className="w-3 h-3 md:w-4 md:h-4" /> }, 
  { name: "Nur Naşiri", minXp: 10000, color: "text-orange-600", border: "border-orange-500", icon: <Sun className="w-3 h-3 md:w-4 md:h-4" /> }, 
  { name: "Erkan-ı Nur", minXp: 25000, color: "text-amber-600", border: "border-amber-500", icon: <Flame className="w-3 h-3 md:w-4 md:h-4" /> } 
];

export const getRank = (xp: number) => {
  return [...RANKS].reverse().find(r => xp >= r.minXp) || RANKS[0];
};

export const getStreakStyle = (streak: number) => {
  if (streak >= 365) return "border-indigo-500 shadow-indigo-200 ring-indigo-100";
  if (streak >= 180) return "border-emerald-500 shadow-emerald-200 ring-emerald-100";
  if (streak >= 90) return "border-red-500 shadow-red-200 ring-red-100";
  if (streak >= 30) return "border-orange-500 shadow-orange-200 ring-orange-100";
  return "border-slate-300 shadow-slate-100";
};

// MOCK DATA
export const MENTOR_REGISTRATION_CODE = "ATLAS2025";

export const MOCK_GROUP: Group = {
  id: "g1",
  name: "Yıldızlar Grubu (Lise 2)",
  mentorId: "m1",
  joinCode: "YILDIZ2025"
};

export const MOCK_MENTOR: Mentor = {
  id: "m1",
  name: "Ahmet Hoca",
  username: "ahmethoca",
  role: UserRole.MENTOR,
  groupIds: ["g1"]
};

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateStr = yesterday.toISOString().split('T')[0];

export const MOCK_STUDENTS: Student[] = [
  {
    id: "s1",
    name: "Yusuf Efe",
    username: "yusufefe",
    avatarUrl: "https://picsum.photos/200/200?random=1",
    role: UserRole.STUDENT,
    streak: 12,
    totalXp: 4520,
    coins: 450,
    level: 5,
    groupId: "g1",
    badges: ["Erken Kalkan", "Kuran Bülbülü"],
    inventory: [{ id: "inv1", type: "STREAK_FREEZE", count: 1 }],
    customTasks: [
      { id: "ct1", title: "Teheccüd Namazı", targetDescription: "2 Rekat", type: TaskType.NAMAZ }
    ],
    logs: [
      { id: "l1", date: dateStr, type: TaskType.QURAN, value: 5, isVerified: true },
      { id: "l2", date: dateStr, type: TaskType.ZIKIR, value: 300, isVerified: true }
    ],
    activeRewards: []
  },
  {
    id: "s2",
    name: "Ömer Faruk",
    username: "omerfaruk",
    avatarUrl: "https://picsum.photos/200/200?random=2",
    role: UserRole.STUDENT,
    streak: 45,
    totalXp: 16400,
    coins: 2400,
    level: 12,
    groupId: "g1",
    badges: ["İstikrar Abidesi", "Hafız Namzeti"],
    inventory: [],
    customTasks: [],
    logs: [],
    activeRewards: [
      { id: 'RAINBOW_NAME', expiresAt: new Date(Date.now() + 86400000).toISOString(), isActive: true }
    ]
  }
];
