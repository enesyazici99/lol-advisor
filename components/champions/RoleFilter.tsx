"use client";

import { useAppStore } from "@/stores/appStore";
import { ROLES } from "@/lib/riot/constants";

export function RoleFilter() {
  const selectedRole = useAppStore((s) => s.selectedRole);
  const setSelectedRole = useAppStore((s) => s.setSelectedRole);

  const allRoles = [null, ...ROLES] as (typeof ROLES[number] | null)[];

  return (
    <div className="flex gap-0 mb-6 border-b border-border">
      {allRoles.map((role) => {
        const isActive = selectedRole === role;
        return (
          <button
            key={role ?? "all"}
            onClick={() => setSelectedRole(role)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              isActive
                ? "border-accent text-accent font-semibold bg-transparent"
                : "border-transparent text-fg-muted hover:text-fg"
            }`}
          >
            {role ?? "ALL"}
          </button>
        );
      })}
    </div>
  );
}
