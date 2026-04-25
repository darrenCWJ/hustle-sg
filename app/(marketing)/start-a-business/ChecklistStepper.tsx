"use client";

import { useState, useTransition } from "react";
import {
  ENTITIES,
  BANK_PICKS,
  BOOKKEEPING,
  type EntityFacts,
} from "@/lib/entrepreneur/entities";
import {
  saveChecklistStep,
  checkNameAvailability,
  mockRegister,
} from "./actions";
import type { CompanyRegistration } from "@/lib/supabase/types";

interface Props {
  initial: CompanyRegistration | null;
  loggedIn: boolean;
}

export function ChecklistStepper({ initial, loggedIn }: Props) {
  const [entity, setEntity] = useState<EntityFacts | null>(
    initial?.entity_type ? ENTITIES[initial.entity_type] : null,
  );
  const [name, setName] = useState(initial?.proposed_name ?? "");
  const [nameStatus, setNameStatus] = useState<null | string>(null);
  const [stage, setStage] = useState(initial?.stage ?? "exploring");
  const [uen, setUen] = useState(initial?.mock_acra_id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const chooseEntity = (e: EntityFacts) => {
    setEntity(e);
    setError(null);
    if (loggedIn) {
      startTransition(async () => {
        const res = await saveChecklistStep({ entity_type: e.type });
        if (!res.ok) setError(res.error);
      });
    }
  };

  const check = async () => {
    setNameStatus(null);
    const res = await checkNameAvailability(name);
    setNameStatus(res.ok ? "available" : res.reason);
    if (res.ok && loggedIn) {
      startTransition(async () => {
        await saveChecklistStep({
          proposed_name: name,
          stage: "name_reserved",
        });
        setStage("name_reserved");
      });
    }
  };

  const register = async () => {
    startTransition(async () => {
      const res = await mockRegister();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setUen(res.uen);
      setStage("registered");
    });
  };

  return (
    <div className="space-y-8">
      {/* Stage 1: Decide */}
      <Stage
        n={1}
        title="Decide"
        active={!entity}
        done={Boolean(entity)}
      >
        <div className="grid md:grid-cols-2 gap-4">
          {Object.values(ENTITIES).map((e) => (
            <button
              key={e.type}
              type="button"
              onClick={() => chooseEntity(e)}
              className={`text-left rounded-card border p-6 transition hover:-translate-y-0.5 ${
                entity?.type === e.type
                  ? "border-ink bg-ink text-surface"
                  : "border-line bg-surface-raised hover:border-ink"
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest opacity-60">
                {e.type === "sole_prop" ? "Simple" : "Serious"}
              </p>
              <h3 className="font-display text-2xl mt-2">{e.label}</h3>
              <p className={`text-sm mt-1 ${entity?.type === e.type ? "opacity-80" : "text-ink-soft"}`}>
                {e.tagline}
              </p>
              <dl className="mt-4 space-y-1 text-xs">
                <Row k="Cost" v={e.cost} />
                <Row k="Liability" v={e.liability} />
                <Row k="Tax" v={e.tax} />
                <Row k="Investors" v={e.investors} />
              </dl>
            </button>
          ))}
        </div>

        {entity && (
          <div className="mt-6 rounded-card border border-line p-5 bg-surface-raised">
            <p className="text-[10px] uppercase tracking-widest text-ink-soft">
              Good fit for
            </p>
            <ul className="mt-2 flex flex-wrap gap-2 text-sm">
              {entity.bestFor.map((b) => (
                <li key={b} className="rounded-pill border border-line px-3 py-1">
                  {b}
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {entity.notes.map((n) => (
                <li key={n}>— {n}</li>
              ))}
            </ul>
          </div>
        )}
      </Stage>

      {/* Stage 2: Name */}
      <Stage
        n={2}
        title="Reserve a name"
        active={Boolean(entity) && stage !== "registered"}
        done={stage === "name_reserved" || stage === "registered"}
      >
        <p className="text-sm text-ink-soft mb-3">
          Try a descriptive name. We&apos;ll check against ACRA-restricted terms.
        </p>
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameStatus(null);
            }}
            placeholder="Kaya Toast Creative Pte Ltd"
            className="flex-1 rounded-xl border border-line px-4 py-3 bg-surface-raised"
          />
          <button
            type="button"
            onClick={check}
            disabled={!name}
            className="rounded-pill bg-ink text-surface px-5 font-semibold disabled:opacity-40"
          >
            Check
          </button>
        </div>
        {nameStatus === "available" && (
          <p className="text-sm text-trust mt-3">✓ Name available. Reserved for 120 days.</p>
        )}
        {nameStatus && nameStatus !== "available" && (
          <p className="text-sm text-accent mt-3">✗ {nameStatus}</p>
        )}
      </Stage>

      {/* Stage 3: Register */}
      <Stage
        n={3}
        title="Register via ACRA BizFile+"
        active={stage === "name_reserved"}
        done={stage === "registered"}
      >
        {stage === "registered" ? (
          <div className="rounded-card bg-ink text-surface p-6">
            <p className="text-[10px] uppercase tracking-widest text-accent">Your UEN</p>
            <p className="font-mono text-3xl mt-2">{uen}</p>
            <p className="text-sm text-surface/70 mt-3">
              This is what BizFile+ returns on approval. Use it below for
              bank applications.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-soft mb-3">
              Registers a {entity?.label} for <em>{name}</em>. On BizFile+,
              you&apos;d authenticate via Singpass and pay the filing fee.
            </p>
            <button
              type="button"
              onClick={register}
              disabled={isPending || !entity || stage !== "name_reserved"}
              className="rounded-pill bg-accent text-ink px-5 py-2 font-semibold disabled:opacity-40"
            >
              {isPending ? "Submitting…" : "Submit via ACRA BizFile+ →"}
            </button>
          </div>
        )}
      </Stage>

      {/* Stage 4: Post-registration */}
      <Stage
        n={4}
        title="After you register"
        active={stage === "registered"}
        done={false}
      >
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-card border border-line p-5 bg-surface-raised">
            <h4 className="font-semibold">Business bank account</h4>
            <p className="text-sm text-ink-soft mt-1">Pick based on volume, fees, integrations.</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {BANK_PICKS.map((b) => (
                <li key={b.name}>
                  <strong>{b.name}</strong>{" "}
                  <span className="text-ink-soft">— {b.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line p-5 bg-surface-raised">
            <h4 className="font-semibold">Bookkeeping</h4>
            <p className="text-sm text-ink-soft mt-1">Start clean from day one.</p>
            <ul className="mt-3 space-y-1.5 text-sm">
              {BOOKKEEPING.map((b) => (
                <li key={b.name}>
                  <strong>{b.name}</strong>{" "}
                  <span className="text-ink-soft">— {b.note}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-line p-5 bg-surface-raised md:col-span-2">
            <h4 className="font-semibold">CPF & GST reminders</h4>
            <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
              <li>
                Self-employed with net trade income &gt; S$6,000 → contribute to
                Medisave. CPF Board sends you a notice.
              </li>
              <li>
                Turnover over S$1M? Register for GST within 30 days via IRAS myTax Portal.
              </li>
              <li>
                Hiring? Register as employer with CPF Board; CPF contributions apply monthly.
              </li>
            </ul>
          </div>
        </div>
      </Stage>

      {error && <p className="text-sm text-accent">{error}</p>}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="opacity-60">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function Stage({
  n,
  title,
  active,
  done,
  children,
}: {
  n: number;
  title: string;
  active: boolean;
  done: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-card border p-6 lg:p-8 ${
        active
          ? "border-ink bg-surface-raised"
          : done
          ? "border-line bg-surface-raised opacity-90"
          : "border-line bg-surface opacity-70"
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <span
          className={`h-9 w-9 rounded-full grid place-items-center font-display ${
            done
              ? "bg-trust text-surface"
              : active
              ? "bg-accent text-ink"
              : "bg-muted text-ink-soft"
          }`}
        >
          {done ? "✓" : n}
        </span>
        <h3 className="font-display text-display-md">{title}</h3>
      </div>
      {children}
    </section>
  );
}
