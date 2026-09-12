import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  const initial = siteConfig.name.trim().charAt(0).toUpperCase() || "V";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1E483C",
          color: "#F1F8F5",
          fontSize: 36,
          fontWeight: 700,
          borderRadius: 14,
        }}
      >
        {initial}
      </div>
    ),
    { ...size },
  );
}
