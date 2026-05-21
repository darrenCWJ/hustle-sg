"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  PROFILES,
  GIGS,
  type DemoProfile,
  type DemoGig,
  type DemoApplication,
  type DemoMessage,
} from "./data";

// ── State shapes ───────────────────────────────────────────────────────────────

interface SharedState {
  applications: DemoApplication[];
  messages: DemoMessage[];
  customGigs: DemoGig[];
}

interface LocalState {
  sessionId: string;
  activeAccountId: string;
}

interface DemoContextValue {
  // Local
  activeAccountId: string;
  activeAccount: DemoProfile;
  sessionId: string | null;
  // Shared
  applications: DemoApplication[];
  messages: DemoMessage[];
  // Actions
  switchAccount: (id: string) => void;
  resetDemo: () => void;
  createSession: (code?: string) => Promise<void>;
  applyToGig: (gigId: string) => void;
  postGig: (gig: Omit<DemoGig, "id">) => void;
  updateApplicationStatus: (appId: string, status: DemoApplication["status"]) => void;
  sendMessage: (applicationId: string, body: string) => void;
  getGigsForAccount: () => DemoGig[];
  getApplicationsForAccount: () => DemoApplication[];
  getApplicationsForRequestor: () => (DemoApplication & { gig: DemoGig; freelancer: DemoProfile })[];
  getMessagesForApplication: (applicationId: string) => DemoMessage[];
}

// ── Storage keys ───────────────────────────────────────────────────────────────

const SESSION_KEY = "demo-session-id";
const ACCOUNT_KEY = "demo-active-account";

function genCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function loadLocal(): LocalState {
  if (typeof window === "undefined") return { sessionId: "", activeAccountId: "" };
  return {
    sessionId: localStorage.getItem(SESSION_KEY) ?? "",
    activeAccountId: localStorage.getItem(ACCOUNT_KEY) ?? "",
  };
}

function saveLocal(local: LocalState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, local.sessionId);
  localStorage.setItem(ACCOUNT_KEY, local.activeAccountId);
}

function defaultShared(): SharedState {
  return { applications: [], messages: [], customGigs: [] };
}

// ── Context ────────────────────────────────────────────────────────────────────

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [activeAccountId, setActiveAccountId] = useState<string>("");
  const [shared, setShared] = useState<SharedState>(defaultShared);
  const [hydrated, setHydrated] = useState(false);

  const pendingWrite = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Hydration ──────────────────────────────────────────────────────────────

  useEffect(() => {
    const urlCode = searchParams.get("s");
    const local = loadLocal();

    const code = urlCode || local.sessionId || null;
    setActiveAccountId(local.activeAccountId);

    if (code) {
      setSessionId(code);
      saveLocal({ sessionId: code, activeAccountId: local.activeAccountId });
      // Load from Supabase
      supabase
        .from("demo_sessions")
        .select("state")
        .eq("id", code)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.state) {
            setShared(data.state as SharedState);
          }
          setHydrated(true);
        });
    } else {
      setHydrated(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Realtime subscription ──────────────────────────────────────────────────

  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`demo-session-${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "demo_sessions",
          filter: `id=eq.${sessionId}`,
        },
        (payload) => {
          const incoming = (payload.new as { state: SharedState }).state;
          if (incoming) setShared(incoming);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist shared state ───────────────────────────────────────────────────

  function schedulePersist(nextShared: SharedState) {
    if (!sessionId) return;
    if (pendingWrite.current) clearTimeout(pendingWrite.current);
    pendingWrite.current = setTimeout(() => {
      supabase
        .from("demo_sessions")
        .upsert({ id: sessionId, state: nextShared, updated_at: new Date().toISOString() })
        .then(() => {});
    }, 200);
  }

  function mutateShared(updater: (prev: SharedState) => SharedState) {
    setShared((prev) => {
      const next = updater(prev);
      schedulePersist(next);
      return next;
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  const createSession = useCallback(async (code?: string) => {
    const id = code ?? genCode();
    await supabase
      .from("demo_sessions")
      .upsert({ id, state: defaultShared(), updated_at: new Date().toISOString() });
    setSessionId(id);
    setShared(defaultShared());
    saveLocal({ sessionId: id, activeAccountId });
  }, [activeAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const switchAccount = useCallback((id: string) => {
    setActiveAccountId(id);
    setSessionId((sid) => {
      saveLocal({ sessionId: sid ?? "", activeAccountId: id });
      return sid;
    });
  }, []);

  const resetDemo = useCallback(() => {
    mutateShared(() => defaultShared());
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyToGig = useCallback((gigId: string) => {
    mutateShared((prev) => {
      const already = prev.applications.some(
        (a) => a.gigId === gigId && a.freelancerId === activeAccountId,
      );
      if (already) return prev;
      const app: DemoApplication = {
        id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        gigId,
        freelancerId: activeAccountId,
        status: "applied",
        createdAt: new Date().toISOString(),
      };
      return { ...prev, applications: [...prev.applications, app] };
    });
  }, [activeAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const postGig = useCallback((gig: Omit<DemoGig, "id">) => {
    const newGig: DemoGig = {
      ...gig,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    mutateShared((prev) => ({ ...prev, customGigs: [...prev.customGigs, newGig] }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateApplicationStatus = useCallback(
    (appId: string, status: DemoApplication["status"]) => {
      mutateShared((prev) => ({
        ...prev,
        applications: prev.applications.map((a) =>
          a.id === appId ? { ...a, status } : a,
        ),
      }));
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const sendMessage = useCallback((applicationId: string, body: string) => {
    mutateShared((prev) => {
      const msg: DemoMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        applicationId,
        senderId: activeAccountId,
        body,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, messages: [...prev.messages, msg] };
    });
  }, [activeAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeAccount =
    PROFILES.find((p) => p.id === activeAccountId) ?? PROFILES[0];

  const allGigs = [...GIGS, ...shared.customGigs];

  const getGigsForAccount = useCallback(() => {
    return allGigs.filter((g) => activeAccount.categories.includes(g.category));
  }, [allGigs, activeAccount]);

  const getApplicationsForAccount = useCallback(() => {
    return shared.applications.filter((a) => a.freelancerId === activeAccountId);
  }, [shared.applications, activeAccountId]);

  const getApplicationsForRequestor = useCallback(() => {
    return shared.applications.map((a) => ({
      ...a,
      gig: allGigs.find((g) => g.id === a.gigId)!,
      freelancer: PROFILES.find((p) => p.id === a.freelancerId)!,
    }));
  }, [shared.applications, allGigs]);

  const getMessagesForApplication = useCallback(
    (applicationId: string) => {
      return shared.messages.filter((m) => m.applicationId === applicationId);
    },
    [shared.messages],
  );

  if (!hydrated) return null;

  return (
    <DemoContext.Provider
      value={{
        activeAccountId,
        activeAccount,
        sessionId,
        applications: shared.applications,
        messages: shared.messages,
        switchAccount,
        resetDemo,
        createSession,
        applyToGig,
        postGig,
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
