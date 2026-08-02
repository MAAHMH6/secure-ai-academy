import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  UserCog,
  Users,
  Contact,
} from "lucide-react";
import { useState } from "react";

type Item = {
  label: string;
  to: string;
  icon: typeof BookOpen;
  search?: Record<string, string>;
  exact?: boolean;
};

const groups: { group: string; items: Item[] }[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
      { label: "Analytics", to: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Users",
    items: [
      { label: "Users & Roles", to: "/admin/users", icon: Users },
      { label: "Access & Enrollments", to: "/admin/access", icon: KeyRound },
    ],
  },
  {
    group: "Learning",
    items: [
      { label: "Courses", to: "/admin/courses", icon: BookOpen, search: { kind: "course" } },
      { label: "Certifications", to: "/admin/courses", icon: GraduationCap, search: { kind: "certification" } },
      { label: "Masterclasses", to: "/admin/courses", icon: Sparkles, search: { kind: "masterclass" } },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "Blog", to: "/admin/blogs", icon: FileText },
      { label: "Mentor & Instructor", to: "/admin/mentor", icon: UserCog },
    ],
  },
  {
    group: "CRM",
    items: [{ label: "Leads & Students", to: "/admin/crm", icon: Contact }],
  },
  {
    group: "Settings",
    items: [{ label: "System", to: "/admin/settings", icon: Settings }],
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useRouterState({ select: (s) => s.location });

  function isActive(item: Item) {
    if (item.exact) return location.pathname === item.to;
    if (location.pathname !== item.to) return false;
    if (item.search) {
      const current = (location.search as Record<string, unknown>).kind ?? "course";
      return current === item.search.kind;
    }
    return true;
  }

  return (
    <aside
      className={`sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-r border-hairline bg-surface/40 py-6 transition-all md:block ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className={`mb-4 flex items-center px-3 ${collapsed ? "justify-center" : "justify-between"}`}>
        {collapsed ? null : (
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Admin panel</span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="rounded-md p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>
      </div>

      <nav className="space-y-5">
        {groups.map((g) => (
          <div key={g.group}>
            {collapsed ? (
              <div className="mx-3 mb-2 border-t border-hairline" />
            ) : (
              <div className="px-4 pb-1.5 text-[10px] font-bold tracking-widest text-muted-foreground/70 uppercase">
                {g.group}
              </div>
            )}
            <ul className="space-y-0.5 px-2">
              {g.items.map((item) => {
                const active = isActive(item);
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      search={item.search}
                      title={item.label}
                      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors ${
                        active
                          ? "bg-brand/10 font-medium text-brand ring-1 ring-brand/30"
                          : "text-muted-foreground hover:bg-surface hover:text-foreground"
                      } ${collapsed ? "justify-center" : ""}`}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {collapsed ? null : <span className="truncate">{item.label}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function AdminMobileNav() {
  return (
    <div className="flex gap-2 overflow-x-auto border-b border-hairline px-4 py-3 md:hidden">
      {groups.flatMap((g) => g.items).map((item) => (
        <Link
          key={item.label}
          to={item.to}
          search={item.search}
          className="shrink-0 rounded-full bg-surface px-3 py-1.5 text-xs text-muted-foreground ring-1 ring-hairline"
          activeProps={{ className: "text-brand ring-brand/30" }}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}