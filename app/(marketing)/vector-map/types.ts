export interface VectorPoint {
  id: string;
  kind: "profile" | "gig";
  label: string;
  sublabel: string | null;
  x: number;
  y: number;
  z: number;
}
