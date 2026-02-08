export const DASHBOARD_ROUTE = "/app";
export const CAMPAIGNS_ROUTE = "/app/campaigns";
export const LEADS_ROUTE = "/app/leads";
export const REPLIES_ROUTE = "/app/replies";
export const SETTINGS_ROUTE = "/app/settings";
export const DASHBOARD_ALIAS_ROUTE = "/app/dashboard";
export const SUPPORT_FALLBACK_URL = "https://www.leadbitz.com";

export const SIDEBAR_COLLAPSE_STORAGE_KEY = "leadbitz.appShell.sidebarCollapsed";
export const LAST_PRIMARY_SECTION_STORAGE_KEY = "leadbitz.appShell.lastPrimarySection";

export type PrimaryNavItem = {
  key: "dashboard" | "campaigns" | "leads" | "replies" | "settings";
  label: "Dashboard" | "Campaigns" | "Leads" | "Replies" | "Settings";
  href: string;
  icon: string;
};

export const PRIMARY_NAV_ITEMS: PrimaryNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: DASHBOARD_ROUTE, icon: "D" },
  { key: "campaigns", label: "Campaigns", href: CAMPAIGNS_ROUTE, icon: "C" },
  { key: "leads", label: "Leads", href: LEADS_ROUTE, icon: "L" },
  { key: "replies", label: "Replies", href: REPLIES_ROUTE, icon: "R" },
  { key: "settings", label: "Settings", href: SETTINGS_ROUTE, icon: "S" },
];

export type GlobalSearchDomain = "Campaigns" | "Leads" | "Replies" | "Settings";

export type GlobalSearchItem = {
  id: string;
  domain: GlobalSearchDomain;
  label: string;
  context: string;
  href: string;
};

export const GLOBAL_SEARCH_ITEMS: GlobalSearchItem[] = [
  {
    id: "campaigns-list",
    domain: "Campaigns",
    label: "Campaign list",
    context: CAMPAIGNS_ROUTE,
    href: CAMPAIGNS_ROUTE,
  },
  {
    id: "campaigns-new",
    domain: "Campaigns",
    label: "New campaign wizard",
    context: "/app/campaigns/new",
    href: "/app/campaigns/new",
  },
  {
    id: "leads-list",
    domain: "Leads",
    label: "Leads list",
    context: LEADS_ROUTE,
    href: LEADS_ROUTE,
  },
  {
    id: "replies-inbox",
    domain: "Replies",
    label: "Replies inbox",
    context: REPLIES_ROUTE,
    href: REPLIES_ROUTE,
  },
  {
    id: "settings-home",
    domain: "Settings",
    label: "Workspace settings",
    context: SETTINGS_ROUTE,
    href: SETTINGS_ROUTE,
  },
  {
    id: "settings-inboxes",
    domain: "Settings",
    label: "Inbox settings",
    context: "/app/settings/inboxes",
    href: "/app/settings/inboxes",
  },
  {
    id: "settings-sources",
    domain: "Settings",
    label: "Source connectors",
    context: "/app/settings/sources",
    href: "/app/settings/sources",
  },
  {
    id: "settings-deliverability",
    domain: "Settings",
    label: "Deliverability settings",
    context: "/app/settings/deliverability",
    href: "/app/settings/deliverability",
  },
  {
    id: "settings-suppressions",
    domain: "Settings",
    label: "Suppressions",
    context: "/app/settings/suppressions",
    href: "/app/settings/suppressions",
  },
  {
    id: "settings-verification",
    domain: "Settings",
    label: "Verification settings",
    context: "/app/settings/verification",
    href: "/app/settings/verification",
  },
];
