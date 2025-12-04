import { CheckinsWithTabs } from "@/components/checkins/checkins-with-tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-4 sm:space-y-6">
      {/* Integrated Layout with Occupancy Card */}
      <div className="relative animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-r from-surface/20 to-card/20 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        <div className="relative space-y-3 sm:space-y-4">
          {/* Header Row with Occupancy Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-text to-primary bg-clip-text text-transparent">
                Check-ins Management
              </h1>
              <p className="text-xs sm:text-sm text-muted/80">
                Monitor gym activity and manage member check-ins
              </p>
            </div>

            {/* Compact Occupancy Badge */}
            <div className="relative animate-scale-in self-end sm:self-auto">
              <div className={`absolute inset-0 bg-gradient-to-r ${occupancyStyle.glow} rounded-xl sm:rounded-2xl blur-lg animate-glow`}></div>
              <div className={`relative bg-gradient-to-br ${occupancyStyle.bg} ${occupancyStyle.border} border-2 rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 sm:py-3 shadow-xl hover:scale-105 transition-all duration-300 backdrop-blur-sm`}>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="hidden sm:block">
                    <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted/60 mb-1">
                      In Gym Now
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${occupancyStyle.indicator} rounded-full animate-pulse`}></div>
                      <span className="text-xs font-semibold text-muted/80">
                        {occupancyStyle.status} capacity
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block h-12 w-px bg-surface/40"></div>
                  <div className="text-center min-w-[50px] sm:min-w-[60px]">
                    <div className={`text-2xl sm:text-3xl font-black tracking-tight ${occupancyStyle.text} drop-shadow-lg`}>
                      {occupancy.total}
                    </div>
                    <div className="text-[10px] sm:text-xs font-semibold text-muted/60 uppercase tracking-wider">
                      People
                    </div>
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

