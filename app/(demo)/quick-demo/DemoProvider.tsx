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
  type DemoRating,
} from "./data";

// ── State shapes ───────────────────────────────────────────────────────────────

export interface BookedSlot {
  gigId: string;
  startTime: string;
  endTime: string;
  label: string;
}

interface SharedState {
  applications: DemoApplication[];
  messages: DemoMessage[];
  customGigs: DemoGig[];
  bookedSlots: BookedSlot[];
  ratings: DemoRating[];
  interviewResponses: Record<string, number[]>; // appId → answered question indices
  interviewVideos: Record<string, string>;      // `${appId}:${questionIdx}` → public storage URL
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
  bookedSlots: BookedSlot[];
  ratings: DemoRating[];
  // Actions
  switchAccount: (id: string) => void;
  resetDemo: () => void;
  createSession: (code?: string) => Promise<void>;
  applyToGig: (gigId: string) => void;
  sendDirectOffer: (freelancerId: string, gigId: string) => void;
  postGig: (gig: Omit<DemoGig, "id">) => string;
  updateApplicationStatus: (appId: string, status: DemoApplication["status"]) => void;
  sendMessage: (applicationId: string, body: string) => void;
  bookSlot: (slot: BookedSlot) => void;
  rateUser: (rating: Omit<DemoRating, "id" | "createdAt">) => void;
  hasRated: (applicationId: string, fromId: string) => boolean;
  recordInterviewResponse: (appId: string, questionIdx: number) => void;
  submitInterview: (appId: string) => void;
  getInterviewResponses: (appId: string) => number[];
  saveInterviewVideo: (appId: string, questionIdx: number, blob: Blob) => Promise<void>;
  getInterviewVideoUrl: (appId: string, questionIdx: number) => string | undefined;
  getAllGigs: () => DemoGig[];
  getGigsForAccount: () => DemoGig[];
  getApplicationsForAccount: () => DemoApplication[];
  getApplicationsForRequestor: () => (DemoApplication & { gig: DemoGig; freelancer: DemoProfile })[];
  getMessagesForApplication: (applicationId: string) => DemoMessage[];
}

// ── Storage keys ───────────────────────────────────────────────────────────────

const SESSION_KEY = "demo-session-id";
const ACCOUNT_KEY = "demo-active-account";

function sharedCacheKey(sid: string) {
  return `demo-shared-cache-${sid}`;
}

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

function loadCachedShared(sid: string): SharedState {
  if (typeof window === "undefined") return defaultShared();
  try {
    const raw = localStorage.getItem(sharedCacheKey(sid));
    if (raw) return { ...defaultShared(), ...JSON.parse(raw) };
  } catch {}
  return defaultShared();
}

function saveCachedShared(sid: string, state: SharedState) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(sharedCacheKey(sid), JSON.stringify(state)); } catch {}
}

function defaultShared(): SharedState {
  return { applications: [], messages: [], customGigs: [], bookedSlots: [], ratings: [], interviewResponses: {}, interviewVideos: {} };
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
      // Show per-session cache instantly, then sync Supabase in background
      setShared(loadCachedShared(code));
      setHydrated(true);
      supabase
        .from("demo_sessions")
        .select("state")
        .eq("id", code)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.state) {
            const fresh = data.state as SharedState;
            setShared(fresh);
            saveCachedShared(code, fresh);
          }
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
      if (sessionId) saveCachedShared(sessionId, next);
      schedulePersist(next);
      return next;
    });
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  const createSession = useCallback(async (code?: string) => {
    const id = code ?? genCode();
    if (code) {
      // Joining existing session — load remote state and cache it immediately
      const { data } = await supabase
        .from("demo_sessions")
        .select("state")
        .eq("id", id)
        .maybeSingle();
      const state: SharedState = (data?.state as SharedState) ?? defaultShared();
      setShared(state);
      saveCachedShared(id, state);
    } else {
      // Creating new session — push fresh state and clean up stale sessions
      const fresh = defaultShared();
      await supabase
        .from("demo_sessions")
        .upsert({ id, state: fresh, updated_at: new Date().toISOString() });
      setShared(fresh);
      saveCachedShared(id, fresh);
      cleanupStaleVideos();
    }
    setSessionId(id);
    saveLocal({ sessionId: id, activeAccountId });
  }, [activeAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function cleanupStaleVideos() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: staleSessions } = await supabase
      .from("demo_sessions")
      .select("id")
      .lt("updated_at", cutoff);
    if (!staleSessions?.length) return;
    for (const session of staleSessions) {
      const { data: folders } = await supabase.storage.from("demo-videos").list(session.id);
      if (folders?.length) {
        for (const folder of folders) {
          const { data: files } = await supabase.storage.from("demo-videos").list(`${session.id}/${folder.name}`);
          if (files?.length) {
            const paths = files.map((f) => `${session.id}/${folder.name}/${f.name}`);
            await supabase.storage.from("demo-videos").remove(paths);
          }
        }
      }
      await supabase.from("demo_sessions").delete().eq("id", session.id);
    }
  }

  const switchAccount = useCallback((id: string) => {
    setActiveAccountId(id);
    setSessionId((sid) => {
      saveLocal({ sessionId: sid ?? "", activeAccountId: id });
      return sid;
    });
  }, []);

  const resetDemo = useCallback(() => {
    mutateShared(() => defaultShared());
    if (sessionId) {
      // Delete all uploaded demo videos for this session from storage
      supabase.storage.from("demo-videos").list(sessionId).then(({ data }) => {
        if (data && data.length > 0) {
          // list() returns files at the top level; need to list subdirs (appId folders)
          const folderNames = data.map((item) => item.name);
          Promise.all(
            folderNames.map((folder) =>
              supabase.storage.from("demo-videos").list(`${sessionId}/${folder}`).then(({ data: files }) => {
                if (files && files.length > 0) {
                  const paths = files.map((f) => `${sessionId}/${folder}/${f.name}`);
                  return supabase.storage.from("demo-videos").remove(paths);
                }
              })
            )
          );
        }
      });
    }
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

  const sendDirectOffer = useCallback((freelancerId: string, gigId: string) => {
    mutateShared((prev) => {
      const already = prev.applications.some(
        (a) => a.gigId === gigId && a.freelancerId === freelancerId,
      );
      if (already) return prev;
      const appId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const gig = [...GIGS, ...(prev.customGigs ?? [])].find((g) => g.id === gigId);
      const app: DemoApplication = {
        id: appId,
        gigId,
        freelancerId,
        status: "offered",
        createdAt: new Date().toISOString(),
      };
      const inviteMsg = {
        id: `msg-${Date.now()}`,
        applicationId: appId,
        senderId: activeAccountId!,
        body: `Hi! I came across your profile and think you'd be a great fit for "${gig?.title ?? "this gig"}". I'd love for you to take a look and let me know if you're interested.`,
        createdAt: new Date().toISOString(),
      };
      return {
        ...prev,
        applications: [...prev.applications, app],
        messages: [...(prev.messages ?? []), inviteMsg],
      };
    });
  }, [activeAccountId]); // eslint-disable-line react-hooks/exhaustive-deps

  const postGig = useCallback((gig: Omit<DemoGig, "id">): string => {
    const newGig: DemoGig = {
      ...gig,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    mutateShared((prev) => ({ ...prev, customGigs: [...prev.customGigs, newGig] }));
    return newGig.id;
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

  const bookSlot = useCallback((slot: BookedSlot) => {
    mutateShared((prev) => {
      const already = prev.bookedSlots.some((s) => s.gigId === slot.gigId);
      if (already) return prev;
      return { ...prev, bookedSlots: [...prev.bookedSlots, slot] };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rateUser = useCallback((rating: Omit<DemoRating, "id" | "createdAt">) => {
    mutateShared((prev) => {
      const already = (prev.ratings ?? []).some(
        (r) => r.applicationId === rating.applicationId && r.fromId === rating.fromId,
      );
      if (already) return prev;
      const newRating: DemoRating = {
        ...rating,
        id: `rating-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, ratings: [...(prev.ratings ?? []), newRating] };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasRated = useCallback(
    (applicationId: string, fromId: string) => {
      return (shared.ratings ?? []).some(
        (r) => r.applicationId === applicationId && r.fromId === fromId,
      );
    },
    [shared.ratings],
  );

  const recordInterviewResponse = useCallback((appId: string, questionIdx: number) => {
    mutateShared((prev) => {
      const existing = prev.interviewResponses?.[appId] ?? [];
      if (existing.includes(questionIdx)) return prev;
      return {
        ...prev,
        interviewResponses: { ...prev.interviewResponses, [appId]: [...existing, questionIdx] },
      };
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submitInterview = useCallback((appId: string) => {
    mutateShared((prev) => ({
      ...prev,
      applications: prev.applications.map((a) =>
        a.id === appId ? { ...a, status: "interviewing" } : a,
      ),
    }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getInterviewResponses = useCallback(
    (appId: string) => shared.interviewResponses?.[appId] ?? [],
    [shared.interviewResponses],
  );

  const saveInterviewVideo = useCallback(async (appId: string, questionIdx: number, blob: Blob) => {
    if (!sessionId) return;
    const ext = blob.type.includes("mp4") ? "mp4" : "webm";
    const path = `${sessionId}/${appId}/${questionIdx}.${ext}`;
    const { error } = await supabase.storage.from("demo-videos").upload(path, blob, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("demo-videos").getPublicUrl(path);
      mutateShared((prev) => ({
        ...prev,
        interviewVideos: { ...(prev.interviewVideos ?? {}), [`${appId}:${questionIdx}`]: publicUrl },
      }));
    }
  }, [sessionId]); // eslint-disable-line react-hooks/exhaustive-deps

  const getInterviewVideoUrl = useCallback(
    (appId: string, questionIdx: number) => shared.interviewVideos?.[`${appId}:${questionIdx}`],
    [shared.interviewVideos],
  );

  const activeAccount =
    PROFILES.find((p) => p.id === activeAccountId) ?? PROFILES[0];

  const allGigs = [...GIGS, ...shared.customGigs];

  const getAllGigs = useCallback(() => allGigs, [allGigs]);

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
        bookedSlots: shared.bookedSlots ?? [],
        ratings: shared.ratings ?? [],
        switchAccount,
        resetDemo,
        createSession,
        applyToGig,
        sendDirectOffer,
        postGig,
        updateApplicationStatus,
        sendMessage,
        bookSlot,
        rateUser,
        hasRated,
        recordInterviewResponse,
        submitInterview,
        getInterviewResponses,
        saveInterviewVideo,
        getInterviewVideoUrl,
        getAllGigs,
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
