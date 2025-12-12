import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Briefcase, Edit, Banknote, Clock, Calendar, CheckCircle, XCircle, Users, FileText, Package, Hash } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ServiceViewPageProps {
  params: Promise<{ id: string }>;
}

async function fetchServiceById(id: string) {
  const { fetchServices } = await import("@/lib/data");
  const services = await fetchServices();
  return services.find(service => service.id === id) || null;
}

export default async function ServiceViewPage({ params }: ServiceViewPageProps) {
  const { id } = await params;
  const service = await fetchServiceById(id);

  if (!service) {
    notFound();
  }

  const typeLabels = {
    'personal_trainer': 'Personal Training',
    'professional_massage': 'Professional Massage'
  };

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      {/* Modern Header with Status */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl sm:rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
          {/* Enhanced Border Effect */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                 style={{ 
                   mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude',
                   padding: '1px'
                 }}>
            </div>
          </div>
          
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
                <div className="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-primary/10 flex-shrink-0">
                  <Briefcase className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text truncate">{service.name}</h1>
                    {service.is_active ? (
                      <Badge variant="default" className="bg-green-500/30 text-white border-0 text-xs sm:text-sm rounded-full">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-500/30 text-white border-0 text-xs sm:text-sm rounded-full">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Service Details</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Edit Service Button */}
                <Link href={`/services/${service.id}/edit`} className="flex-1 sm:flex-none">
                  <button
                    className="group relative h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95"
                  >
                    {/* Edit Icon */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:translate-x-[3.2em]">
                      <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover:text-cyan-100 group-hover:scale-110" />
                    </div>
                    {/* Text */}
                    <span className="hidden sm:inline transition-all duration-500 ease-in-out group-hover:opacity-0">
                      Edit Service
                    </span>
                    {/* Mobile text */}
                    <span className="sm:hidden transition-all duration-500 ease-in-out group-hover:opacity-0">
                      Edit
                    </span>
                  </button>
                </Link>
                {/* Back Button */}
                <Link 
                  href="/services"
                  className="group/link relative h-8 sm:h-9 w-full sm:w-auto px-3 sm:px-4 md:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden border-0 !ring-0 !outline-none active:scale-95 !no-underline flex-1 sm:flex-none"
                >
                  {/* Arrow Icon */}
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1.3em]">
                    <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover/link:text-cyan-100 group-hover/link:scale-110" />
                  </div>
                  
                  {/* Text */}
                  <span className="transition-all duration-500 ease-in-out group-hover/link:opacity-0">
                    Back
                  </span>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-primary/20 border-0">
                    <Banknote className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Price</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{formatCurrency(service.price)}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 border-0">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Duration</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{service.duration_minutes} min</p>
                  </div>
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br border-0 ${
                service.is_active 
                  ? 'from-green-500/10 to-green-500/15'
                  : 'from-red-500/10 to-red-500/15'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg border-0 ${
                    service.is_active 
                      ? 'bg-green-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    {service.is_active ? (
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Service Status</p>
                    <p className={`text-base sm:text-lg font-bold ${
                      service.is_active 
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Information Card */}
      <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
        {/* Card Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
        
        <CardHeader className="relative p-4 sm:p-5 pb-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">
                Service Information
              </CardTitle>
              <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Detailed service configuration and settings</p>
            </div>
          </div>
        </CardHeader>
          
        <CardContent className="relative p-4 sm:p-5 pt-2">
          <div className="grid lg:grid-cols-3 gap-2.5 sm:gap-3">
            
            {/* Basic Information Container */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                  <Package className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Basic Information</h3>
              </div>
              
              {/* Cards */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service Name</p>
                    <p className="text-xs text-text font-semibold truncate">{service.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    <Package className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Service Type</p>
                    <p className="text-xs text-text font-semibold truncate">
                      {typeLabels[service.service_type as keyof typeof typeLabels] || service.service_type}
                    </p>
                  </div>
                </div>

                {service.session_type ? (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                    <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Session Type</p>
                      <p className="text-xs text-text font-semibold truncate">{service.session_type.replace('_', ' ')}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/10 backdrop-blur-sm border-0 opacity-40">
                    <div className="p-1.5 rounded-md bg-surface/20">
                      <Users className="h-3.5 w-3.5 text-muted/40" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted/40 uppercase tracking-wide">Session Type</p>
                      <p className="text-muted/50 text-[10px]">Not specified</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description Section - Shows second on mobile, hidden on desktop (shown below) */}
            {service.description && (
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300 lg:hidden">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                  <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Description</h3>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-text font-medium leading-relaxed">{service.description}</p>
                </div>
              </div>
            )}

            {/* Pricing & Duration Container */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                  <Banknote className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Pricing & Duration</h3>
              </div>
              
              {/* Cards */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    <Banknote className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Price</p>
                    <p className="text-xs text-text font-semibold">{formatCurrency(service.price)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Duration</p>
                    <p className="text-xs text-text font-semibold">{service.duration_minutes} minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    <Hash className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Display Order</p>
                    <p className="text-xs text-text font-semibold">{service.display_order || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings & Configuration Container */}
            <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                  <Users className="h-3.5 w-3.5 text-primary" />
                </div>
                <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Settings & Configuration</h3>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Max Sessions</p>
                    <p className="text-xs text-text font-semibold">{service.max_sessions || 1}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Advance Booking</p>
                    <p className="text-xs text-text font-semibold">
                      {service.requires_advance_booking 
                        ? `${service.advance_booking_hours}h` 
                        : 'Not required'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                  <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                    {service.is_active ? (
                      <CheckCircle className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Status</p>
                    <Badge 
                      variant={service.is_active ? 'default' : 'secondary'} 
                      className={`w-fit text-[10px] px-2 py-0.5 border-0 ${
                        service.is_active 
                          ? 'bg-green-500/30 text-white' 
                          : 'bg-red-500/30 text-white'
                      }`}
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section - Full Width on Desktop (below the 3-column grid) */}
          {service.description && (
            <div className="hidden lg:block mt-3 sm:mt-4 relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm flex-shrink-0">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-xs text-text font-medium leading-relaxed">{service.description}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
