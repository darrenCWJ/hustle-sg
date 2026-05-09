// Incremental power-iteration PCA — reduces high-dim vectors to k dimensions.
// Works for small n (< 200) in pure TypeScript with no dependencies.

function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

function normalize(a: number[]): number[] {
  const n = Math.sqrt(dot(a, a)) || 1e-10;
  return a.map((x) => x / n);
}

export function pca3(
  vectors: number[][],
): { coords: [number, number, number][]; explained: number[] } {
  if (vectors.length === 0) return { coords: [], explained: [0, 0, 0] };

  const n = vectors.length;
  const d = vectors[0].length;

  // Center
  const mean = new Array(d).fill(0);
  for (const v of vectors) for (let j = 0; j < d; j++) mean[j] += v[j] / n;
  const X = vectors.map((v) => v.map((x, j) => x - mean[j]));

  const pcs: number[][] = [];
  const eigenvalues: number[] = [];

  for (let k = 0; k < 3; k++) {
    // Random unit init (seeded-ish for reproducibility)
    let pc = Array.from({ length: d }, (_, i) =>
      Math.sin(i * 2.399 + k * 1.618),
    );
    pc = normalize(pc);

    let eigenvalue = 0;
    for (let iter = 0; iter < 200; iter++) {
      // v = X^T (X pc)
      const Xpc = X.map((row) => dot(row, pc));
      const result = new Array(d).fill(0);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < d; j++) result[j] += X[i][j] * Xpc[i];

      // Deflate previous PCs
      for (const prev of pcs) {
        const proj = dot(result, prev);
        for (let j = 0; j < d; j++) result[j] -= proj * prev[j];
      }

      eigenvalue = Math.sqrt(dot(result, result));
      pc = normalize(result);
    }

    pcs.push(pc);
    eigenvalues.push(eigenvalue);
  }

  const totalVar = eigenvalues.reduce((s, v) => s + v, 0) || 1;

  const coords = X.map(
    (v) =>
      [dot(v, pcs[0]), dot(v, pcs[1]), dot(v, pcs[2])] as [
        number,
        number,
        number,
      ],
  );

  return {
    coords,
    explained: eigenvalues.map((e) => Math.round((e / totalVar) * 100)),
  };
}

// Normalise coords to roughly fit in a [-scale, scale] cube
export function normaliseCoords(
  raw: [number, number, number][],
  scale = 4,
): [number, number, number][] {
  if (raw.length === 0) return [];
  const maxAbs = raw.reduce(
    (m, c) => Math.max(m, Math.abs(c[0]), Math.abs(c[1]), Math.abs(c[2])),
    0,
  ) || 1;
  return raw.map(([x, y, z]) => [
    (x / maxAbs) * scale,
    (y / maxAbs) * scale,
    (z / maxAbs) * scale,
  ]);
}
