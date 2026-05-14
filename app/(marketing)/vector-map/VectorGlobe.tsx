"use client";

import { useRef, useState, useCallback, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Line,
  Sphere,
  GradientTexture,
} from "@react-three/drei";
import * as THREE from "three";
import type { VectorPoint } from "./types";

// ─── colour palette ───────────────────────────────────────────────────────────
const PROFILE_COLOR = "#38bdf8"; // sky-400
const PROFILE_GLOW = "#0ea5e9";
const GIG_COLOR = "#fbbf24"; // amber-400
const GIG_GLOW = "#f59e0b";
const SELECTED_COLOR = "#ffffff";
const LINE_COLOR = "#94a3b8"; // slate-400

// ─── distance helper ──────────────────────────────────────────────────────────
function dist(a: VectorPoint, b: VectorPoint) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
}

// ─── Node sphere ─────────────────────────────────────────────────────────────
function Node({
  point,
  selected,
  highlighted,
  onSelect,
}: {
  point: VectorPoint;
  selected: boolean;
  highlighted: boolean;
  onSelect: (p: VectorPoint) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const isProfile = point.kind === "profile";
  const baseColor = isProfile ? PROFILE_COLOR : GIG_COLOR;
  const glowColor = isProfile ? PROFILE_GLOW : GIG_GLOW;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = selected ? 1.6 : hovered ? 1.25 : highlighted ? 1.1 : 1;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      target,
      delta * 6,
    );
    const scaleTarget = selected ? 1.5 : hovered ? 1.2 : 1;
    meshRef.current.scale.setScalar(
      THREE.MathUtils.lerp(meshRef.current.scale.x, scaleTarget, delta * 8),
    );
  });

  const r = isProfile ? 0.09 : 0.11;

  return (
    <mesh
      ref={meshRef}
      position={[point.x, point.y, point.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(point);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <sphereGeometry args={[r, 20, 20]} />
      <meshStandardMaterial
        color={selected ? SELECTED_COLOR : baseColor}
        emissive={selected ? SELECTED_COLOR : glowColor}
        emissiveIntensity={1}
        roughness={0.1}
        metalness={0.4}
      />
      {/* Label on hover or selected */}
      {(hovered || selected) && (
        <Html
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
          position={[0, r + 0.2, 0]}
        >
          <div
            style={{
              background: "rgba(5,5,15,0.92)",
              border: `1px solid ${selected ? "#fff3" : isProfile ? "#38bdf840" : "#fbbf2440"}`,
              borderRadius: 10,
              padding: "7px 12px",
              minWidth: 140,
              maxWidth: 220,
              backdropFilter: "blur(8px)",
              color: "#fff",
              fontFamily: "system-ui, sans-serif",
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              overflow: "hidden",
              boxShadow: selected ? `0 0 16px ${isProfile ? PROFILE_GLOW : GIG_GLOW}60` : "none",
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: isProfile ? PROFILE_COLOR : GIG_COLOR,
                marginBottom: 3,
              }}
            >
              {isProfile ? "● Profile" : "◆ Gig"}
            </div>
            <div
              style={{ fontWeight: 600, fontSize: 13, color: "#fff" }}
            >
              {point.label}
            </div>
            {point.sublabel && (
              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {point.sublabel}
              </div>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ─── Nearest-neighbour connection lines ───────────────────────────────────────
function NearestLines({
  selected,
  all,
  k = 5,
}: {
  selected: VectorPoint;
  all: VectorPoint[];
  k?: number;
}) {
  const nearest = useMemo(() => {
    const oppositeKind = selected.kind === "profile" ? "gig" : "profile";
    return [...all]
      .filter((p) => p.kind === oppositeKind)
      .sort((a, b) => dist(a, selected) - dist(b, selected))
      .slice(0, k);
  }, [selected, all, k]);

  return (
    <>
      {nearest.map((n) => (
        <Line
          key={n.id}
          points={[
            [selected.x, selected.y, selected.z],
            [n.x, n.y, n.z],
          ]}
          color={LINE_COLOR}
          lineWidth={1}
          opacity={0.35}
          transparent
          dashed={false}
        />
      ))}
    </>
  );
}

// ─── Axis guides ─────────────────────────────────────────────────────────────
function Axes({ size = 5 }: { size?: number }) {
  return (
    <>
      {([
        [[0, 0, 0], [size, 0, 0], "#ef4444"],
        [[0, 0, 0], [0, size, 0], "#22c55e"],
        [[0, 0, 0], [0, 0, size], "#3b82f6"],
      ] as const).map(([start, end, color], i) => (
        <Line
          key={i}
          points={[start as any, end as any]}
          color={color as string}
          lineWidth={0.5}
          opacity={0.25}
          transparent
        />
      ))}
    </>
  );
}

// ─── Particle starfield ──────────────────────────────────────────────────────
function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(2000 * 3);
    for (let i = 0; i < 2000; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 80;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#ffffff" opacity={0.4} transparent />
    </points>
  );
}

// ─── Auto-rotate wrapper that stops on user interaction ──────────────────────
function AutoRotate() {
  const { camera } = useThree();
  const angleRef = useRef(0);
  const [rotating, setRotating] = useState(true);

  useFrame((_, delta) => {
    if (!rotating) return;
    angleRef.current += delta * 0.12;
    const r = (camera as THREE.PerspectiveCamera).position.length();
    camera.position.x = Math.sin(angleRef.current) * r;
    camera.position.z = Math.cos(angleRef.current) * r;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function VectorGlobe({
  points,
  explained,
  profileCount,
  gigCount,
}: {
  points: VectorPoint[];
  explained: number[];
  profileCount: number;
  gigCount: number;
}) {
  const [selected, setSelected] = useState<VectorPoint | null>(null);
  const [filter, setFilter] = useState<"all" | "profile" | "gig">("all");

  const visible = useMemo(
    () =>
      filter === "all" ? points : points.filter((p) => p.kind === filter),
    [points, filter],
  );

  const nearestIds = useMemo(() => {
    if (!selected) return new Set<string>();
    const oppositeKind = selected.kind === "profile" ? "gig" : "profile";
    const others = points.filter((p) => p.kind === oppositeKind);
    others.sort((a, b) => dist(a, selected) - dist(b, selected));
    return new Set(others.slice(0, 5).map((p) => p.id));
  }, [selected, points]);

  const handleSelect = useCallback((p: VectorPoint) => {
    setSelected((s) => {
      if (s?.id === p.id) {
        setFilter("all");
        return null;
      }
      setFilter(p.kind === "profile" ? "gig" : "profile");
      return p;
    });
  }, []);

  const isEmpty = points.length === 0;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#050509",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Header overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          padding: "22px 28px",
          background:
            "linear-gradient(to bottom, rgba(5,5,9,0.9) 0%, transparent 100%)",
          display: "flex",
          alignItems: "start",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#38bdf8",
              fontWeight: 700,
              margin: "0 0 4px",
              fontFamily: "monospace",
            }}
          >
            HustleSG · AI Vector Space
          </p>
          <h1
            style={{
              color: "#fff",
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontSize: "clamp(1.6rem, 3vw, 2.6rem)",
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1,
            }}
          >
            Embedding{" "}
            <span style={{ color: "#fbbf24" }}>universe</span>
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: 12,
              margin: "6px 0 0",
              fontFamily: "monospace",
            }}
          >
            1536-dim → 3-dim PCA &nbsp;·&nbsp; PC1 {explained[0]}% &nbsp;·&nbsp; PC2{" "}
            {explained[1]}% &nbsp;·&nbsp; PC3 {explained[2]}%
          </p>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "rgba(5,5,15,0.7)",
            border: "1px solid #ffffff18",
            borderRadius: 14,
            padding: "14px 18px",
            backdropFilter: "blur(12px)",
          }}
        >
          <LegendRow
            color={PROFILE_COLOR}
            shape="●"
            label="Freelancer profiles"
            count={profileCount}
            active={filter !== "gig"}
            onClick={() => setFilter((f) => (f === "profile" ? "all" : "profile"))}
          />
          <LegendRow
            color={GIG_COLOR}
            shape="◆"
            label="Open gigs"
            count={gigCount}
            active={filter !== "profile"}
            onClick={() => setFilter((f) => (f === "gig" ? "all" : "gig"))}
          />
        </div>
      </div>

      {/* Selected panel */}
      {selected && (
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 28,
            zIndex: 10,
            background: "rgba(5,5,15,0.88)",
            border: `1px solid ${selected.kind === "profile" ? PROFILE_COLOR + "50" : GIG_COLOR + "50"}`,
            borderRadius: 16,
            padding: "18px 22px",
            maxWidth: 320,
            backdropFilter: "blur(16px)",
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p
            style={{
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color:
                selected.kind === "profile" ? PROFILE_COLOR : GIG_COLOR,
              fontWeight: 700,
              margin: "0 0 6px",
            }}
          >
            {selected.kind === "profile" ? "● Freelancer" : "◆ Gig"} · selected
          </p>
          <p
            style={{
              fontWeight: 700,
              fontSize: 18,
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            {selected.label}
          </p>
          {selected.sublabel && (
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 12px" }}>
              {selected.sublabel}
            </p>
          )}
          <p style={{ fontSize: 12, color: "#475569", margin: 0 }}>
            Lines show 5 nearest {selected.kind === "profile" ? "matching gigs" : "matching freelancers"}
          </p>
          <button
            onClick={() => setSelected(null)}
            style={{
              marginTop: 12,
              padding: "5px 12px",
              borderRadius: 999,
              border: "1px solid #ffffff20",
              background: "transparent",
              color: "#94a3b8",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Deselect ×
          </button>
        </div>
      )}

      {/* Hint */}
      {!selected && !isEmpty && (
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
            color: "#334155",
            fontSize: 12,
            fontFamily: "monospace",
            letterSpacing: "0.08em",
          }}
        >
          Drag to orbit · Scroll to zoom · Click a node
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 10,
            display: "grid",
            placeItems: "center",
            color: "#334155",
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          <div>
            <p style={{ fontSize: 18, color: "#475569" }}>No embeddings yet</p>
            <p style={{ fontSize: 13, margin: "8px 0 0" }}>
              Run <code style={{ color: "#38bdf8" }}>npm run seed</code> to
              populate the vector space
            </p>
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2, 12], fov: 60 }}
        style={{ background: "transparent" }}
        onPointerMissed={() => { setSelected(null); setFilter("all"); }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-8, -6, -10]} intensity={0.6} color="#3b82f6" />
        <pointLight position={[8, -6, 10]} intensity={0.5} color="#f59e0b" />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={25}
        />

        <Stars />
        <Axes size={5} />

        {visible.map((p) => (
          <Node
            key={p.id}
            point={p}
            selected={selected?.id === p.id}
            highlighted={nearestIds.has(p.id)}
            onSelect={handleSelect}
          />
        ))}

        {selected && <NearestLines selected={selected} all={points} />}
      </Canvas>
    </div>
  );
}

// ─── Legend row ───────────────────────────────────────────────────────────────
function LegendRow({
  color,
  shape,
  label,
  count,
  active,
  onClick,
}: {
  color: string;
  shape: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: 0,
        opacity: active ? 1 : 0.35,
        transition: "opacity 0.2s",
      }}
    >
      <span style={{ color, fontSize: 14, width: 14 }}>{shape}</span>
      <span
        style={{
          color: "#cbd5e1",
          fontSize: 12.5,
          fontWeight: 500,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "#475569",
          marginLeft: 4,
        }}
      >
        {count}
      </span>
    </button>
  );
}
