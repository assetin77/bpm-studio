import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BPM Studio",
  description: "러닝 케이던스에 맞춰 음악의 템포를 바꾸는 로컬 오디오 스튜디오"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#0c0b10] text-[#f7f4fc]">{children}</body>
    </html>
  );
}
