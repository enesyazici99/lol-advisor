"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/appStore";

interface HomeClientProps {
  version: string;
}

export function HomeClient({ version }: HomeClientProps) {
  const setVersion = useAppStore((s) => s.setVersion);

  useEffect(() => {
    if (version) setVersion(version);
  }, [version, setVersion]);

  return null;
}
