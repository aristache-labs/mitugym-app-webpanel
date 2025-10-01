"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarViewModal } from "./calendar-view-modal";
import type { ServiceBooking } from "@/types";
import type { TimeFormat } from "@/lib/settings";
import { CalendarDays } from "lucide-react";

interface CalendarViewButtonProps {
  bookings: ServiceBooking[];
  timeFormat?: TimeFormat;
}

export function CalendarViewButton({ bookings, timeFormat }: CalendarViewButtonProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsCalendarOpen(true)}
        className="gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary border-secondary/30 hover:border-secondary/50 shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl group"
      >
        <CalendarDays className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
        Calendar View
      </Button>

      <CalendarViewModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        bookings={bookings}
        timeFormat={timeFormat}
      />
    </>
  );
}

