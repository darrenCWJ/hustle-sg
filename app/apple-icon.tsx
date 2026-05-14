import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#1a1a1a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "#f0b429",
            fontSize: 110,
            fontWeight: 700,
            fontFamily: "serif",
            lineHeight: 1,
          }}
        >
          h
        </span>
      </div>
    ),
    { ...size }
  );
}
