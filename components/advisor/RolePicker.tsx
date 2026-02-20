"use client";

import { ROLES, type Role } from "@/lib/riot/constants";
import { CyberButton } from "@/components/ui/CyberButton";

const ROLE_ICONS: Record<Role, string> = {
  TOP: "\u2694\uFE0F",
  JGL: "\uD83C\uDF32",
  MID: "\uD83C\uDFAF",
  ADC: "\uD83C\uDFF9",
  SUP: "\uD83D\uDEE1\uFE0F",
};

interface RolePickerProps {
  selectedRole: Role | null;
  onSelect: (role: Role) => void;
  autoDetectedRole?: Role | null;
}

export function RolePicker({
  selectedRole,
  onSelect,
  autoDetectedRole,
}: RolePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-fg-secondary">Select Role</label>
      <div className="flex gap-2 flex-wrap">
        {ROLES.map((role) => (
          <CyberButton
            key={role}
            variant="tab"
            active={selectedRole === role}
            onClick={() => onSelect(role)}
            className="relative"
          >
            <span className="mr-1">{ROLE_ICONS[role]}</span>
            {role}
            {autoDetectedRole === role && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
            )}
          </CyberButton>
        ))}
      </div>
      {autoDetectedRole && selectedRole === autoDetectedRole && (
        <span className="text-xs text-accent">Auto-detected from match history</span>
      )}
    </div>
  );
}
