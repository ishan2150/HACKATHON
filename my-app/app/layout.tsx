import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "StudyBuddy — AI Personal Study Planner & Exam Copilot",
  description: "Adaptive AI study planner for college students. Prioritize weak topics, auto-schedule realistic daily study blocks, practice diagnostic quizzes, and boost exam readiness.",
  keywords: ["study planner", "AI study buddy", "BTech CSE exam prep", "adaptive study schedule", "pomodoro timer", "spaced repetition"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className={`${inter.variable} min-h-full flex flex-col bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
