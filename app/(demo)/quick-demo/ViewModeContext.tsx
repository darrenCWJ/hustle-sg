"use client";

import { createContext, useContext } from "react";

export type ViewMode = "mobile" | "desktop";

export const ViewModeContext = createContext<{
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
}>({ viewMode: "mobile", setViewMode: () => {} });

export function useViewMode() {
  return useContext(ViewModeContext);
}
