import { CheckinsWithTabs } from "@/components/checkins/checkins-with-tabs";
import { fetchCheckIns, fetchOccupancy } from "@/lib/data";
import { getTimeFormat } from "@/lib/timezone";

export const metadata = {
  title: "Check-ins",
};

export default async function CheckinsPage() {
  const [checkIns, occupancy, timeFormat] = await Promise.all([
    fetchCheckIns(), 
    fetchOccupancy(),
    getTimeFormat(),
  ]);
  
  // Dynamic color coding based on occupancy levels
  const getOccupancyColor = (count: number) => {
    if (count === 0) {
      return {
        bg: "from-primary/20 to-accent/20",
        border: "border-primary/40",
        text: "text-primary",
        glow: "from-primary/30 to-accent/30",
        indicator: "bg-primary",
        status: "Empty"
      };
    } else if (count >= 1 && count <= 5) {
      return {
        bg: "from-success/20 to-emerald-500/20",
        border: "border-success/40",
        text: "text-success",
        glow: "from-success/30 to-emerald-500/30",
        indicator: "bg-success",
        status: "Low"
      };
    } else if (count >= 6 && count <= 15) {
      return {
        bg: "from-warning/20 to-orange-500/20",
        border: "border-warning/40",
        text: "text-warning",
        glow: "from-warning/30 to-orange-500/30",
        indicator: "bg-warning",
        status: "Moderate"
      };
    } else {
      return {
        bg: "from-error/20 to-red-500/20",
        border: "border-error/40",
        text: "text-error",
        glow: "from-error/30 to-red-500/30",
        indicator: "bg-error",
        status: "High"
      };
    }
  };

  const occupancyStyle = getOccupancyColor(occupancy.total);

  return (
    <div className="space-y-6 sm:space-y-8 overflow-x-hidden">
      {/* Integrated Layout with Occupancy Card */}
      <div className="relative animate-fade-in-up">
        <div className="relative space-y-3 sm:space-y-4">
          {/* Header Row with Occupancy Badge */}
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                Check-ins Management
              </h1>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted/80 truncate">
                Monitor gym activity and manage member check-ins
              </p>
            </div>

            {/* Occupancy Card */}
            <div className="relative flex-shrink-0 animate-scale-in">
              <div
                className={`relative overflow-hidden rounded-lg sm:rounded-xl border px-3 sm:px-4 py-2 sm:py-3 
                            bg-surface/80 backdrop-blur-xl shadow-lg 
                            transition-all duration-500 hover:shadow-xl ${occupancyStyle.border}`}
              >
                {/* subtle gradient background */}
                <div
                  className={`pointer-events-none absolute inset-0 opacity-40 bg-gradient-to-br ${occupancyStyle.bg}`}
                />

                {/* content */}
                <div className="relative space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full animate-pulse ${occupancyStyle.indicator}`}
                    />
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted">
                      In Gym Now
                    </span>
                    <span
                      className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] 
                                  font-semibold uppercase tracking-wide bg-black/40 ${occupancyStyle.text}`}
                    >
                      {occupancyStyle.status}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-xl sm:text-2xl font-black leading-none text-text">
                      {occupancy.total}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-muted/90">
                      people
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkins Section */}
          <CheckinsWithTabs data={checkIns} timeFormat={timeFormat} />
        </div>
      </div>
    </div>
  );
}

