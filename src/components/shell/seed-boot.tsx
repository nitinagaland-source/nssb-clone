"use client";

import { useEffect } from "react";
import { seedIfEmpty } from "@/lib/seed";

export function SeedBoot() {
  useEffect(() => {
    seedIfEmpty();
  }, []);
  return null;
}
