"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  PROFILES,
  GIGS,
  type DemoProfile,
  type DemoGig,
  type DemoApplication,
  type DemoMessage,
} from "./data";

interface DemoState {
  activeAccountId: string;
  applications: DemoApplication[];
  messages: DemoMessage[];
}

interface DemoContextValue extends DemoState {
  activeAccount: DemoProfile;
  switchAccount: (id: string) => void;
  resetDemo: () => void;
  applyToGig: (gigId: string) => void;
  updateApplicationStatus: (appId: string, status: DemoApplication["status"]) => void;
  sendMessage: (applicationId: string, body: string) => void;
  getGigsForAccount: () => DemoGig[];
  getApplicationsForAccount: () => DemoApplication[];
  getApplicationsForRequestor: () => (DemoApplication & { gig: DemoGig; freelancer: DemoProfile })[];
  getMessagesForApplication: (applicationId: string) => DemoMessage[];
}

const STORAGE_KEY = "hustle-demo-state";

function loadState(): DemoState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultState();
}

function defaultState(): DemoState {
  return { activeAccountId: "", applications: [], messages: [] };
}

function saveState(state: DemoState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const activeAccount =
    PROFILES.find((p) => p.id === state.activeAccountId) ?? PROFILES[0];

  const switchAccount = useCallback((id: string) => {
    setState((prev) => ({ ...prev, activeAccountId: id }));
  }, []);

  const resetDemo = useCallback(() => {
    const fresh: DemoState = { activeAccountId: state.activeAccountId, applications: [], messages: [] };
    setState(fresh);
  }, [state.activeAccountId]);

  const applyToGig = useCallback((gigId: string) => {
    setState((prev) => {
      const already = prev.applications.some(
        (a) => a.gigId === gigId && a.freelancerId === prev.activeAccountId,
      );
      if (already) return prev;
      const app: DemoApplication = {
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        gigId,
        freelancerId: prev.activeAccountId,
        status: "applied",
        createdAt: new Date().toISOString(),
      };
      return { ...prev, applications: [...prev.applications, app] };
    });
  }, []);

  const updateApplicationStatus = useCallback(
    (appId: string, status: DemoApplication["status"]) => {
      setState((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === appId ? { ...a, status } : a,
        ),
      }));
    },
    [],
  );

  const sendMessage = useCallback((applicationId: string, body: string) => {
    setState((prev) => {
      const msg: DemoMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        applicationId,
        senderId: prev.activeAccountId,
        body,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, messages: [...prev.messages, msg] };
    });
  }, []);

  const getGigsForAccount = useCallback(() => {
    return GIGS.filter((g) => activeAccount.categories.includes(g.category));
  }, [activeAccount]);

  const getApplicationsForAccount = useCallback(() => {
    return state.applications.filter((a) => a.freelancerId === state.activeAccountId);
  }, [state.applications, state.activeAccountId]);

  const getApplicationsForRequestor = useCallback(() => {
    return state.applications.map((a) => ({
      ...a,
      gig: GIGS.find((g) => g.id === a.gigId)!,
      freelancer: PROFILES.find((p) => p.id === a.freelancerId)!,
    }));
  }, [state.applications]);

  const getMessagesForApplication = useCallback(
    (applicationId: string) => {
      return state.messages.filter((m) => m.applicationId === applicationId);
    },
    [state.messages],
  );

  if (!hydrated) return null;

  return (
    <DemoContext.Provider
      value={{
        ...state,
        activeAccount,
        switchAccount,
        resetDemo,
        applyToGig,
        updateApplicationStatus,
        sendMessage,
        getGigsForAccount,
        getApplicationsForAccount,
        getApplicationsForRequestor,
        getMessagesForApplication,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
