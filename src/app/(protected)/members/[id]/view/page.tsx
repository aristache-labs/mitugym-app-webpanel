import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fetchCheckIns, fetchMemberById, fetchPurchasedServices, fetchSessionBookings, fetchAuditLogs } from "@/lib/data";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import { AvatarWithPreview } from "@/components/members/avatar-preview-modal";
import { ArrowLeft, User, Activity, Edit, Mail, Phone, Calendar, CreditCard, UserCheck, AlertCircle, TrendingUp, ShoppingBag, Clock, CalendarCheck, Package, Cake, Users, MapPin, Building, Map } from "lucide-react";
import { getTimeFormat } from "@/lib/timezone";

interface ViewMemberPageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewMemberPage({ params }: ViewMemberPageProps) {
  const { id } = await params;

  const [member, allCheckIns, purchasedServices, serviceBookings, auditLogs, timeFormat] = await Promise.all([
    fetchMemberById(id),
    fetchCheckIns(),
    fetchPurchasedServices(),
    fetchSessionBookings(),
    fetchAuditLogs(),
    getTimeFormat(),
  ]);

  if (!member) {
    notFound();
  }

  // Filter data for this specific member
  const memberCheckIns = allCheckIns.filter(checkIn => checkIn.member_id === member.id);
  const recentCheckIns = memberCheckIns.slice(0, 10);
  const memberPurchasedServices = purchasedServices.filter(service => service.member_id === member.id);
  const memberBookings = serviceBookings.filter(booking => booking.member_id === member.id);
  const memberAuditLogs = auditLogs.filter(log => log.entity_id === member.id).slice(0, 10);

  // Calculate member stats
  const totalCheckIns = memberCheckIns.length;
  const thisMonth = new Date();
  const startOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const checkInsThisMonth = memberCheckIns.filter(checkIn => 
    new Date(checkIn.checked_in_at) >= startOfMonth
  ).length;

  // Check membership status
  const isExpired = member.expires_at && new Date(member.expires_at) < new Date();
  const isPending = member.starts_at && new Date(member.starts_at) > new Date();

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
                <AvatarWithPreview
                  avatarUrl={member.avatar_url}
                  memberName={member.full_name}
                  size="large"
                />
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text truncate">{member.full_name}</h1>
                  <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Member since {formatDate(member.created_at)}</p>
                  <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 flex-wrap">
                    {isPending ? (
                      <Badge variant="secondary" className="bg-yellow-500/30 text-white border-0 text-xs sm:text-sm rounded-full">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                    ) : isExpired ? (
                      <Badge variant="destructive" className="bg-red-500/30 text-white border-0 text-xs sm:text-sm rounded-full">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-500/30 text-white border-0 text-xs sm:text-sm rounded-full">
                        ✓ Active
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* Edit Member Button */}
                <Link href={`/members/${member.id}`} className="flex-1 sm:flex-none">
                  <button
                    className="group relative h-8 sm:h-9 md:h-10 px-3 sm:px-4 md:px-6 w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-700/75 via-cyan-900/45 to-slate-700/75 hover:from-slate-600/85 hover:via-cyan-800/55 hover:to-slate-600/85 text-white font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/20 hover:shadow-lg hover:shadow-cyan-950/25 transition-all duration-500 ease-out overflow-hidden !border-none !ring-0 !outline-none active:scale-95"
                  >
                    {/* Edit Icon */}
                    <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:translate-x-[3.2em]">
                      <Edit className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-cyan-300/60 group-hover:text-cyan-100 group-hover:scale-110" />
                    </div>
                    {/* Text */}
                    <span className="hidden sm:inline transition-all duration-500 ease-in-out group-hover:opacity-0">
                    Edit Member
                    </span>
                    {/* Mobile text */}
                    <span className="sm:hidden transition-all duration-500 ease-in-out group-hover:opacity-0">
                      Edit
                    </span>
                  </button>
                </Link>
                {/* Back Button - Secondary Style */}
                <Link 
                  href="/members"
                  className="group/link relative h-8 sm:h-9 w-full sm:w-auto px-3 sm:px-4 md:px-6 flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-br from-slate-800/60 via-slate-800/50 to-slate-900/60 hover:from-slate-700/70 hover:via-slate-700/60 hover:to-slate-800/70 text-slate-300 hover:text-slate-100 font-medium text-xs sm:text-sm rounded-2xl backdrop-blur-sm shadow-md shadow-black/10 hover:shadow-lg hover:shadow-black/20 transition-all duration-500 ease-out overflow-hidden border border-slate-700/40 hover:border-slate-600/60 !ring-0 !outline-none active:scale-95 !no-underline flex-1 sm:flex-none"
                >
                  {/* Arrow Icon */}
                  <div className="relative z-10 flex items-center justify-center transition-all duration-500 ease-in-out group-hover/link:scale-125 group-hover/link:translate-x-[1.3em]">
                    <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 transition-all duration-500 ease-in-out text-slate-400/70 group-hover/link:text-slate-200 group-hover/link:scale-110" />
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
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Total Check-ins</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{totalCheckIns}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 border-0">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">This Month</p>
                    <p className="text-xl sm:text-2xl font-bold text-text">{checkInsThisMonth}</p>
                  </div>
                </div>
              </div>
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br border-0 ${
                isExpired 
                  ? 'from-red-500/10 to-red-500/15' 
                  : isPending 
                  ? 'from-yellow-500/10 to-yellow-500/15'
                  : 'from-green-500/10 to-green-500/15'
              }`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`p-1.5 sm:p-2 rounded-lg border-0 ${
                    isExpired 
                      ? 'bg-red-500/20' 
                      : isPending 
                      ? 'bg-yellow-500/20'
                      : 'bg-green-500/20'
                  }`}>
                    <UserCheck className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      isExpired 
                        ? 'text-red-500' 
                        : isPending 
                        ? 'text-yellow-500'
                        : 'text-green-500'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-muted/70">Plan Status</p>
                    <p className={`text-base sm:text-lg font-bold ${
                      isExpired 
                        ? 'text-red-600' 
                        : isPending 
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {member.expires_at ? (isExpired ? 'Expired' : isPending ? 'Pending' : 'Active') : 'No Plan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Content Grid */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6">
        {/* Left Column: Member Information + Membership Plan */}
        <div className="space-y-4 sm:space-y-5">
          {/* Member Information Card */}
          <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/40 overflow-hidden rounded-2xl sm:rounded-3xl">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
            
            <CardHeader className="relative p-4 sm:p-5 pb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-text group-hover:text-primary transition-colors">
                    Member Information
                  </CardTitle>
                  <p className="text-[10px] sm:text-xs text-muted/70 mt-0.5">Personal details and membership information</p>
                </div>
              </div>
            </CardHeader>
              
            <CardContent className="relative p-4 sm:p-5 pt-2">
              <div className="grid lg:grid-cols-3 gap-2.5 sm:gap-3">
                
                {/* Personal Information Container */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                    <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <Users className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Personal Information</h3>
                  </div>
                  
                  {/* Cards */}
                  <div className="space-y-2">
                  {member.date_of_birth ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                        <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                          <Cake className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Birth Date</p>
                          <p className="text-xs text-text font-semibold truncate">{formatDate(member.date_of_birth)}</p>
                      </div>
                    </div>
                  ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/10 backdrop-blur-sm border-0 opacity-40">
                        <div className="p-1.5 rounded-md bg-surface/20">
                          <Cake className="h-3.5 w-3.5 text-muted/40" />
                        </div>
                      <div>
                          <p className="text-[10px] font-medium text-muted/40 uppercase tracking-wide">Birth Date</p>
                          <p className="text-muted/50 text-[10px]">Not provided</p>
                      </div>
                    </div>
                  )}
                  
                  {member.gender ? (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                        <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                      <div>
                          <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Gender</p>
                          <p className="text-xs text-text font-semibold capitalize">{member.gender}</p>
                      </div>
                    </div>
                  ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/10 backdrop-blur-sm border-0 opacity-40">
                        <div className="p-1.5 rounded-md bg-surface/20">
                          <Users className="h-3.5 w-3.5 text-muted/40" />
                        </div>
                      <div>
                          <p className="text-[10px] font-medium text-muted/40 uppercase tracking-wide">Gender</p>
                          <p className="text-muted/50 text-[10px]">Not provided</p>
                      </div>
                    </div>
                  )}
                  
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                      <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                        <CreditCard className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Membership Plan</p>
                        <p className="text-xs text-text font-semibold truncate">
                         {member.plan_name || 'No plan assigned'}
                       </p>
                        {(member.expires_at || member.starts_at) && (
                          <p className={`text-[9px] mt-0.5 truncate font-medium ${isExpired ? 'text-red-400' : isPending ? 'text-yellow-500' : 'text-primary/60'}`}>
                            {isExpired 
                              ? `Expired: ${formatDate(member.expires_at)}` 
                              : isPending 
                              ? `Starts: ${formatDate(member.starts_at)}` 
                              : `Expires: ${formatDate(member.expires_at)}`}
                         </p>
                       )}
                      </div>
                     </div>
                   </div>
                </div>

                {/* Contact Information Container */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                    <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <Mail className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Contact Information</h3>
                  </div>
                  
                  {/* Cards */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                      <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Email Address</p>
                        <p className="text-xs text-text font-semibold truncate">{member.email}</p>
                    </div>
                  </div>
                  
                  {member.phone ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                        <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                        </div>
                      <div>
                          <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Phone Number</p>
                          <p className="text-xs text-text font-semibold">{member.phone}</p>
                      </div>
                    </div>
                  ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/10 backdrop-blur-sm border-0 opacity-40">
                        <div className="p-1.5 rounded-md bg-surface/20">
                          <Phone className="h-3.5 w-3.5 text-muted/40" />
                        </div>
                      <div>
                          <p className="text-[10px] font-medium text-muted/40 uppercase tracking-wide">Phone Number</p>
                          <p className="text-muted/50 text-[10px]">Not provided</p>
                      </div>
                    </div>
                  )}
                  </div>
                </div>

                {/* Location & Membership Container */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-primary/5 via-primary/3 to-transparent rounded-xl border-0 p-2.5 shadow-md hover:shadow-lg transition-all duration-300">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-primary/10">
                    <div className="p-1.5 rounded-lg bg-primary/10 backdrop-blur-sm">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <h3 className="text-[11px] font-bold text-text uppercase tracking-wider">Location & Membership</h3>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2">
                   {member.address ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                        <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">Address</p>
                          <p className="text-xs text-text font-semibold truncate">{member.address}</p>
                       </div>
                     </div>
                   ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/10 backdrop-blur-sm border-0 opacity-40">
                        <div className="p-1.5 rounded-md bg-surface/20">
                          <MapPin className="h-3.5 w-3.5 text-muted/40" />
                        </div>
                       <div>
                          <p className="text-[10px] font-medium text-muted/40 uppercase tracking-wide">Address</p>
                          <p className="text-muted/50 text-[10px]">Not provided</p>
                       </div>
                     </div>
                   )}
                   
                   {member.city ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                        <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                          <Building className="h-3.5 w-3.5 text-primary" />
                        </div>
                       <div>
                          <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">City</p>
                          <p className="text-xs text-text font-semibold">{member.city}</p>
                       </div>
                     </div>
                   ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/10 backdrop-blur-sm border-0 opacity-40">
                        <div className="p-1.5 rounded-md bg-surface/20">
                          <Building className="h-3.5 w-3.5 text-muted/40" />
                        </div>
                       <div>
                          <p className="text-[10px] font-medium text-muted/40 uppercase tracking-wide">City</p>
                          <p className="text-muted/50 text-[10px]">Not provided</p>
                       </div>
                     </div>
                   )}
                   
                   {member.county ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-surface/60 to-surface/40 backdrop-blur-sm border-0 hover:from-surface/70 hover:to-surface/50 transition-all duration-200 group/card shadow-sm">
                        <div className="p-1.5 rounded-md bg-primary/15 group-hover/card:bg-primary/25 transition-colors backdrop-blur-sm">
                          <Map className="h-3.5 w-3.5 text-primary" />
                        </div>
                       <div>
                          <p className="text-[10px] font-medium text-primary/80 uppercase tracking-wide">County</p>
                          <p className="text-xs text-text font-semibold">{member.county}</p>
                       </div>
                     </div>
                   ) : (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/10 backdrop-blur-sm border-0 opacity-40">
                        <div className="p-1.5 rounded-md bg-surface/20">
                          <Map className="h-3.5 w-3.5 text-muted/40" />
                        </div>
                       <div>
                          <p className="text-[10px] font-medium text-muted/40 uppercase tracking-wide">County</p>
                          <p className="text-muted/50 text-[10px]">Not provided</p>
                       </div>
                     </div>
                   )}
                 </div>
                </div>
                
              </div>
            </CardContent>
          </Card>

          {/* Membership Plan Card */}
          {member.plan_name && (
            <Card className={`group relative backdrop-blur-xl border shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden rounded-xl ${
              isExpired 
                ? 'bg-gradient-to-br from-red-500/15 via-red-500/10 to-red-500/5 border-red-500/40 hover:border-red-500/60' 
                : isPending 
                ? 'bg-gradient-to-br from-yellow-500/15 via-yellow-500/10 to-yellow-500/5 border-yellow-500/40 hover:border-yellow-500/60'
                : 'bg-gradient-to-br from-green-500/15 via-green-500/10 to-green-500/5 border-green-500/40 hover:border-green-500/60'
            }`}>
              {/* Shine Effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
              <CardContent className="relative p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`p-2 rounded-xl bg-gradient-to-br flex-shrink-0 ${
                      isExpired 
                        ? 'from-red-500/25 to-red-500/15' 
                        : isPending 
                        ? 'from-yellow-500/25 to-yellow-500/15'
                        : 'from-green-500/25 to-green-500/15'
                    }`}>
                      <CreditCard className={`h-5 w-5 ${
                        isExpired 
                          ? 'text-red-600' 
                          : isPending 
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`} />
                  </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-white/90">Membership Plan</span>
                  </div>
                      <h3 className={`text-base sm:text-lg font-bold transition-colors truncate ${
                        isExpired 
                          ? 'text-red-700 group-hover:text-red-600' 
                          : isPending 
                          ? 'text-yellow-700 group-hover:text-yellow-600'
                          : 'text-green-700 group-hover:text-green-600'
                      }`}>
                        {member.plan_name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap text-xs">
                        {isPending ? (
                          <>
                            <span className="text-muted/70">Starts on</span>
                            <div className="w-0.5 h-0.5 rounded-full bg-muted/40"></div>
                            <span className="font-semibold text-yellow-600">
                              {formatDate(member.starts_at)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-muted/70">Active since</span>
                            <div className="w-0.5 h-0.5 rounded-full bg-muted/40"></div>
                            <span className="font-semibold text-text">
                              {formatDate(member.created_at)}
                            </span>
                          </>
                        )}
                        {member.expires_at && (
                          <>
                            <div className="w-0.5 h-0.5 rounded-full bg-muted/40"></div>
                            <span className={`font-semibold ${
                              isExpired ? 'text-red-600' : isPending ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {isExpired ? 'Expired' : 'Expires'} {formatDate(member.expires_at)}
                            </span>
                          </>
                        )}
                </div>
                </div>
              </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-bold px-2.5 py-1 flex-shrink-0 border-0 rounded-full ${
                      isExpired 
                        ? 'text-white bg-red-500/30' 
                        : isPending 
                        ? 'text-white bg-yellow-500/30'
                        : 'text-white bg-green-500/30'
                    }`}
                  >
                    {isExpired ? 'EXPIRED' : isPending ? 'PENDING' : member.status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity Card */}
        <div>
          <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-surface/60 overflow-hidden rounded-2xl sm:rounded-3xl h-fit">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
            
            <CardHeader className="relative p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1 sm:p-1.5 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-secondary/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-text group-hover:text-secondary transition-colors">
                    Recent Activity
                  </CardTitle>
                  <p className="text-[10px] sm:text-xs text-muted/70">Latest gym visits</p>
                </div>
              </div>
            </CardHeader>
              
            <CardContent className="relative p-3 sm:p-4 md:p-6 pt-0">
              {recentCheckIns.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentCheckIns.map((checkIn, index) => (
                    <div
                      key={checkIn.id}
                      className={`group/item relative rounded-lg sm:rounded-xl p-2 sm:p-3 transition-all duration-200 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-secondary/15 to-secondary/10 border-0 hover:from-secondary/20 hover:to-secondary/15' 
                          : 'bg-gradient-to-br from-surface/60 to-surface/40 border-0 hover:from-surface/70 hover:to-surface/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-secondary/60 group-hover/item:bg-secondary flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-text group-hover/item:text-secondary transition-colors truncate">
                              {formatDate(checkIn.checked_in_at)}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted/60">
                              {formatTime(checkIn.checked_in_at, timeFormat)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                          {index === 0 && (
                            <span className="px-1 sm:px-1.5 py-0.5 bg-secondary/20 text-secondary rounded text-[10px] sm:text-xs font-medium border-0">
                              Latest
                            </span>
                          )}
                          <Badge variant="default" className="capitalize bg-secondary/20 text-secondary border-0 hover:bg-secondary/30 transition-colors text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
                            {checkIn.method || "visit"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                  <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-secondary/5 border-0 mb-2 sm:mb-3">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-secondary/50" />
                  </div>
                  <p className="text-muted/70 font-medium text-xs sm:text-sm">No check-ins yet</p>
                  <p className="text-[10px] sm:text-xs text-muted/50 mt-1">
                    Activity will appear here once the member visits the gym
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services & Bookings Section - Full Width */}
      <div className="space-y-4 sm:space-y-6">
        {/* Services & Bookings Grid */}
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          {/* Purchased Services Section */}
          <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-green-500/40 overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/2 via-green-500/1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <CardHeader className="relative p-3 sm:p-4 md:p-5 pb-2 sm:pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-text">
                      Purchased Services
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted/60 mt-0.5">Service packages</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 border-0 bg-green-500/10 text-xs sm:text-sm px-2.5 py-1">
                  {memberPurchasedServices.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="relative p-3 sm:p-4 md:p-5 pt-0">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {memberPurchasedServices.length > 0 ? (
                    memberPurchasedServices.map((service) => (
                      <div
                        key={service.id}
                      className="group/item relative rounded-xl bg-gradient-to-br from-surface/70 to-surface/50 backdrop-blur-sm p-2.5 sm:p-3 border-0 transition-all duration-200 hover:from-surface/80 hover:to-surface/60 shadow-sm"
                      >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500/15 to-green-500/10 flex-shrink-0">
                            <Package className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-text text-xs sm:text-sm truncate">
                                {service.service?.name || 'Service Package'}
                              </h4>
                            <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5">
                              <span className="text-[9px] sm:text-[10px] text-muted/50">Purchased</span>
                              <div className="w-0.5 h-0.5 rounded-full bg-muted/30"></div>
                              <span className="text-[9px] sm:text-[10px] font-medium text-muted/70">
                                  {formatDate(service.purchase_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-bold text-green-600 mb-0.5">
                            {service.service?.price || '0'} <span className="text-[10px] sm:text-xs font-medium">RON</span>
                            </p>
                            <Badge 
                              variant="outline" 
                            className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 border-0 ${
                                service.status === 'approved' 
                                  ? 'text-green-600 bg-green-500/10' 
                                  : service.status === 'pending'
                                  ? 'text-yellow-600 bg-yellow-500/10'
                                  : 'text-red-600 bg-red-500/10'
                              }`}
                            >
                              {service.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {service.sessions_remaining !== null && (
                        <div className="flex items-center justify-between mt-2 p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-surface/30 to-surface/10 border-0">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500/60"></div>
                            <span className="text-[9px] sm:text-[10px] font-medium text-muted/60">Sessions</span>
                            </div>
                            <div className="text-right">
                            <span className="text-[10px] sm:text-xs font-bold text-text">
                                {service.sessions_remaining} / {service.sessions_total}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-surface/20 to-surface/10 border-0 mb-2 sm:mb-3">
                      <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-muted/50" />
                              </div>
                    <h4 className="font-medium text-text mb-0.5 text-xs sm:text-sm">No Services Purchased</h4>
                    <p className="text-[10px] sm:text-xs text-muted/60">Service purchases will appear here</p>
                        </div>
                      )}
                          </div>
            </CardContent>
          </Card>

          {/* Service Bookings Section */}
          <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-blue-500/40 overflow-hidden rounded-2xl sm:rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/2 via-blue-500/1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <CardHeader className="relative p-3 sm:p-4 md:p-5 pb-2 sm:pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base md:text-lg font-semibold text-text">
                      Session Bookings
                    </CardTitle>
                    <p className="text-[10px] sm:text-xs text-muted/60 mt-0.5">Scheduled sessions</p>
                </div>
              </div>
                <Badge variant="outline" className="text-blue-600 border-0 bg-blue-500/10 text-xs sm:text-sm px-2.5 py-1">
                  {memberBookings.length}
                </Badge>
              </div>
            </CardHeader>
              
            <CardContent className="relative p-3 sm:p-4 md:p-5 pt-0">
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {memberBookings.length > 0 ? (
                    memberBookings.map((booking) => (
                      <div
                        key={booking.id}
                      className="group/item relative rounded-xl bg-gradient-to-br from-surface/70 to-surface/50 backdrop-blur-sm p-2.5 sm:p-3 border-0 transition-all duration-200 hover:from-surface/80 hover:to-surface/60 shadow-sm"
                      >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-500/10 flex-shrink-0">
                            <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-text text-xs sm:text-sm truncate">
                                {booking.service?.name || 'Service Booking'}
                              </h4>
                            <div className="space-y-1 mt-1.5">
                              <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-md bg-surface/20">
                                <Calendar className="h-2.5 w-2.5 text-blue-600/60 flex-shrink-0" />
                                <span className="text-[9px] sm:text-[10px] font-medium text-text truncate">
                                    {formatDate(booking.booking_date)}
                                  </span>
                                </div>
                              <div className="flex items-center justify-between gap-1.5 p-1 sm:p-1.5 rounded-md bg-surface/20">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-2.5 w-2.5 text-blue-600/60 flex-shrink-0" />
                                  <span className="text-[9px] sm:text-[10px] font-medium text-text">
                                    {new Date(booking.booking_date).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    })}
                                  </span>
                                </div>
                                <span className="text-[9px] sm:text-[10px] text-muted/60">
                                      {booking.service?.duration_minutes || 'N/A'} min
                                    </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge 
                              variant="outline" 
                            className={`text-[10px] sm:text-xs font-medium px-2 py-0.5 border-0 ${
                              booking.status === 'confirmed' || booking.status === 'upcoming'
                                  ? 'text-green-600 bg-green-500/10' 
                                  : booking.status === 'pending'
                                  ? 'text-yellow-600 bg-yellow-500/10'
                                  : booking.status === 'completed'
                                  ? 'text-blue-600 bg-blue-500/10'
                                  : 'text-red-600 bg-red-500/10'
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                  <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-surface/20 to-surface/10 border-0 mb-2 sm:mb-3">
                      <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 text-muted/50" />
                      </div>
                    <h4 className="font-medium text-text mb-0.5 text-xs sm:text-sm">No Bookings Scheduled</h4>
                    <p className="text-[10px] sm:text-xs text-muted/60">Session bookings will appear here</p>
                    </div>
                  )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Member Timeline Section */}
      <div className="space-y-4 sm:space-y-6">
        {/* Member Timeline Card */}
        <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-md transition-all duration-300 hover:shadow-lg hover:border-surface/60 overflow-hidden rounded-2xl sm:rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>
          
          <CardHeader className="relative p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-secondary/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-text group-hover:text-secondary transition-colors">
                    Member Timeline
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-muted/70 mt-0.5 sm:mt-1">Account history and important milestones</p>
                </div>
              </div>
              <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10 text-xs sm:text-sm">
                {memberAuditLogs.length} Events
              </Badge>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-4 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
              {/* Key Milestones */}
              <div className="group/item relative rounded-lg sm:rounded-xl bg-gradient-to-r from-green-500/5 to-green-500/10 border border-green-500/20 p-3 sm:p-4 transition-all duration-200 hover:from-green-500/10 hover:to-green-500/15">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20 flex-shrink-0">
                    <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text text-sm sm:text-base">Account Created</p>
                    <p className="text-xs sm:text-sm text-muted/60 truncate">
                      {formatDate(member.created_at)} • Welcome to MituGym!
                    </p>
                  </div>
                </div>
              </div>
              
              {member.plan_name && (
                <div className="group/item relative rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20 p-3 sm:p-4 transition-all duration-200 hover:from-blue-500/10 hover:to-blue-500/15">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20 flex-shrink-0">
                      <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text text-sm sm:text-base">Plan Subscribed</p>
                      <p className="text-xs sm:text-sm text-muted/60 truncate">
                        {formatDate(member.starts_at || member.created_at)} • {member.plan_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {recentCheckIns.length > 0 && (
                <div className="group/item relative rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20 p-3 sm:p-4 transition-all duration-200 hover:from-purple-500/10 hover:to-purple-500/15">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20 flex-shrink-0">
                      <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text text-sm sm:text-base">First Check-in</p>
                      <p className="text-xs sm:text-sm text-muted/60 truncate">
                        {formatDate(recentCheckIns[recentCheckIns.length - 1]?.checked_in_at)} • Started gym activities
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Audit Log Events */}
              {memberAuditLogs.map((log) => (
                <div key={log.id} className="group/item relative rounded-lg sm:rounded-xl bg-gradient-to-r from-surface/60 to-surface/40 border border-surface/30 p-3 sm:p-4 transition-all duration-200 hover:from-surface/80 hover:to-surface/60">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 rounded-lg bg-surface/40 flex-shrink-0">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text capitalize text-sm sm:text-base truncate">
                        {log.action.replace('.', ' ').replace('_', ' ')}
                      </p>
                      <p className="text-xs sm:text-sm text-muted/60 truncate">
                        {formatDate(log.created_at)} • {log.actor_name || 'System'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {member.expires_at && (
                <div className={`group/item relative rounded-lg sm:rounded-xl p-3 sm:p-4 transition-all duration-200 ${
                  isExpired 
                    ? 'bg-gradient-to-r from-red-500/5 to-red-500/10 border border-red-500/20 hover:from-red-500/10 hover:to-red-500/15'
                    : 'bg-gradient-to-r from-yellow-500/5 to-yellow-500/10 border border-yellow-500/20 hover:from-yellow-500/10 hover:to-yellow-500/15'
                }`}>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${isExpired ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                      <AlertCircle className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isExpired ? 'text-red-500' : 'text-yellow-500'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text text-sm sm:text-base">
                        {isExpired ? 'Membership Expired' : 'Membership Expires'}
                      </p>
                      <p className="text-xs sm:text-sm text-muted/60 truncate">
                        {formatDate(member.expires_at)} • {member.plan_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}