"use client";

import { useAppStore } from "@/stores/appStore";
import { ROLES } from "@/lib/riot/constants";
import { CyberButton } from "@/components/ui/CyberButton";

export function RoleFilter() {
  const selectedRole = useAppStore((s) => s.selectedRole);
  const setSelectedRole = useAppStore((s) => s.setSelectedRole);

  return (
    <div className="flex gap-2 mb-6 flex-wrap">
      <CyberButton
        variant="tab"
        active={selectedRole === null}
        onClick={() => setSelectedRole(null)}
      >
        ALL
      </CyberButton>
      {ROLES.map((role) => (
        <CyberButton
          key={role}
          variant="tab"
          active={selectedRole === role}
          onClick={() => setSelectedRole(selectedRole === role ? null : role)}
        >
          {role}
        </CyberButton>
      ))}
    </div>
  );
}
