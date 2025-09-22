import { Activity, CalendarClock, Home, IdCard, LogOut, Newspaper, Settings, Users, Briefcase } from "lucide-react";

export const NAVIGATION = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Members", href: "/members", icon: Users },
  { label: "Membership Plans", href: "/plans", icon: IdCard },
  { label: "Services", href: "/services", icon: Briefcase },
  { label: "Check-ins", href: "/checkins", icon: Activity },
  { label: "News", href: "/news", icon: Newspaper },
  { label: "Schedule", href: "/schedule", icon: CalendarClock },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const SECONDARY_NAVIGATION = [{ label: "Sign out", href: "/logout", icon: LogOut }];

export const DASHBOARD_METRICS = [
  { key: "occupancy", label: "In Gym Now" },
  { key: "activeMembers", label: "Active members" },
  { key: "expiringSoon", label: "Expiring this week" },
];
