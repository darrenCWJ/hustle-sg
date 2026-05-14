import { ImageResponse } from "next/og";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "512px",
          height: "512px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#f0b429",
            fontSize: 290,
            fontWeight: 700,
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          h
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
