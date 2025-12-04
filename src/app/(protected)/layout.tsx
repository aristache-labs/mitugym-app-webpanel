import type { ReactNode } from "react";
import { ProtectedLayoutClient } from "./layout-client";
import { requireStaff } from "@/lib/auth";
import { getAppTimezone, getTimeFormat } from "@/lib/timezone";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const staff = await requireStaff();
  const [timezone, timeFormat] = await Promise.all([
    getAppTimezone(),
    getTimeFormat(),
  ]);

  return (
    <ProtectedLayoutClient
      staff={staff}
      timezone={timezone}
      timeFormat={timeFormat}
    >
      {children}
    </ProtectedLayoutClient>
  );
}
