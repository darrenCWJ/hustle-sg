import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "192px",
          height: "192px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#f0b429",
            fontSize: 108,
            fontWeight: 700,
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          h
        </span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
