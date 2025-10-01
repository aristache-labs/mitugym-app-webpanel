import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const isExpiringSoon = member.expires_at && !isExpired && 
    new Date(member.expires_at) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="space-y-8">
      {/* Modern Header with Status */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          {/* Enhanced Border Effect */}
          <div className="absolute inset-0 rounded-3xl">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-primary/30 to-transparent" 
                 style={{ 
                   mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   WebkitMask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
                   WebkitMaskComposite: 'xor',
                   maskComposite: 'exclude',
                   padding: '1px'
                 }}>
            </div>
          </div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <AvatarWithPreview
                  avatarUrl={member.avatar_url}
                  memberName={member.full_name}
                  size="large"
                />
                <div>
                  <h1 className="text-3xl font-bold text-text">{member.full_name}</h1>
                  <p className="text-muted/70 mt-1">Member since {formatDate(member.created_at)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge 
                      variant={member.status === 'active' ? 'default' : 'secondary'} 
                      className={`${member.status === 'active' ? 'bg-green-500/20 text-green-600 border-green-500/30' : ''}`}
                    >
                      {member.status === 'active' ? '✓ Active' : member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </Badge>
                    {isExpired && (
                      <Badge variant="destructive" className="bg-red-500/20 text-red-600 border-red-500/30">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                    {isExpiringSoon && (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 border-yellow-500/30">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/members/${member.id}`}>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                    <Edit className="h-4 w-4" />
                    Edit Member
                  </Button>
                </Link>
                <Link href="/members">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Members
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Total Check-ins</p>
                    <p className="text-2xl font-bold text-text">{totalCheckIns}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">This Month</p>
                    <p className="text-2xl font-bold text-text">{checkInsThisMonth}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <UserCheck className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Plan Status</p>
                    <p className="text-lg font-bold text-text">
                      {member.expires_at ? (isExpired ? 'Expired' : 'Active') : 'No Plan'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Content Grid */}
      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
        {/* Member Information Card */}
        <div>
          <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            
            <CardHeader className="relative p-8 pb-6">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <User className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                    Member Information
                  </CardTitle>
                  <p className="text-sm text-muted/70 mt-1">Personal details and membership information</p>
                </div>
              </div>
            </CardHeader>
              
            <CardContent className="relative p-8 pt-0">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Personal Information</h3>
                  
                  {member.date_of_birth ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                      <Cake className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted/70">Birth Date</p>
                        <p className="text-text font-semibold">{formatDate(member.date_of_birth)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/10 border border-surface/20 opacity-50">
                      <Cake className="h-5 w-5 text-muted/40 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted/50">Birth Date</p>
                        <p className="text-muted/60 text-sm">Not provided</p>
                      </div>
                    </div>
                  )}
                  
                  {member.gender ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                      <Users className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted/70">Gender</p>
                        <p className="text-text font-semibold capitalize">{member.gender}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/10 border border-surface/20 opacity-50">
                      <Users className="h-5 w-5 text-muted/40 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted/50">Gender</p>
                        <p className="text-muted/60 text-sm">Not provided</p>
                      </div>
                    </div>
                  )}
                  
                   <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                     <CreditCard className="h-5 w-5 text-primary flex-shrink-0" />
                     <div>
                       <p className="text-sm font-medium text-muted/70">Membership Plan</p>
                       <p className="text-text font-semibold">
                         {member.plan_name || 'No plan assigned'}
                       </p>
                       {member.expires_at && (
                         <p className={`text-sm mt-1 ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-yellow-600' : 'text-muted/60'}`}>
                           {isExpired ? 'Expired on:' : 'Expires:'} {formatDate(member.expires_at)}
                         </p>
                       )}
                     </div>
                   </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Contact Information</h3>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted/70">Email Address</p>
                      <p className="text-text font-semibold truncate">{member.email}</p>
                    </div>
                  </div>
                  
                  {member.phone ? (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted/70">Phone Number</p>
                        <p className="text-text font-semibold">{member.phone}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/10 border border-surface/20 opacity-50">
                      <Phone className="h-5 w-5 text-muted/40 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted/50">Phone Number</p>
                        <p className="text-muted/60 text-sm">Not provided</p>
                      </div>
                    </div>
                  )}
                  
                </div>

                 {/* Location & Membership Details */}
                 <div className="space-y-4">
                   <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Location & Membership</h3>
                   
                   {member.address ? (
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                       <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                       <div>
                         <p className="text-sm font-medium text-muted/70">Address</p>
                         <p className="text-text font-semibold">{member.address}</p>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/10 border border-surface/20 opacity-50">
                       <MapPin className="h-5 w-5 text-muted/40 flex-shrink-0" />
                       <div>
                         <p className="text-sm font-medium text-muted/50">Address</p>
                         <p className="text-muted/60 text-sm">Not provided</p>
                       </div>
                     </div>
                   )}
                   
                   {member.city ? (
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                       <Building className="h-5 w-5 text-primary flex-shrink-0" />
                       <div>
                         <p className="text-sm font-medium text-muted/70">City</p>
                         <p className="text-text font-semibold">{member.city}</p>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/10 border border-surface/20 opacity-50">
                       <Building className="h-5 w-5 text-muted/40 flex-shrink-0" />
                       <div>
                         <p className="text-sm font-medium text-muted/50">City</p>
                         <p className="text-muted/60 text-sm">Not provided</p>
                       </div>
                     </div>
                   )}
                   
                   {member.county ? (
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                       <Map className="h-5 w-5 text-primary flex-shrink-0" />
                       <div>
                         <p className="text-sm font-medium text-muted/70">County</p>
                         <p className="text-text font-semibold">{member.county}</p>
                       </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/10 border border-surface/20 opacity-50">
                       <Map className="h-5 w-5 text-muted/40 flex-shrink-0" />
                       <div>
                         <p className="text-sm font-medium text-muted/50">County</p>
                         <p className="text-muted/60 text-sm">Not provided</p>
                       </div>
                     </div>
                   )}
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Card */}
        <div>
          <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-3xl h-fit">
            {/* Card Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
            
            <CardHeader className="relative p-2 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Activity className="h-4 w-4 text-secondary/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-text group-hover:text-secondary transition-colors">
                    Recent Activity
                  </CardTitle>
                  <p className="text-xs text-muted/70">Latest gym visits</p>
                </div>
              </div>
            </CardHeader>
              
            <CardContent className="relative p-1 pt-0">
              {recentCheckIns.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {recentCheckIns.map((checkIn, index) => (
                    <div
                      key={checkIn.id}
                      className={`group/item relative rounded-xl p-3 transition-all duration-200 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-secondary/10 to-secondary/5 border border-secondary/30 hover:from-secondary/15 hover:to-secondary/10 hover:border-secondary/40' 
                          : 'bg-gradient-to-r from-surface/60 to-surface/40 border border-surface/30 hover:from-surface/80 hover:to-surface/60 hover:border-secondary/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-secondary/60 group-hover/item:bg-secondary flex-shrink-0"></div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-text group-hover/item:text-secondary transition-colors truncate">
                              {formatDate(checkIn.checked_in_at)}
                            </p>
                            <p className="text-xs text-muted/60">
                              {formatTime(checkIn.checked_in_at, timeFormat)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {index === 0 && (
                            <span className="px-1.5 py-0.5 bg-secondary/20 text-secondary rounded text-xs font-medium border border-secondary/30">
                              Latest
                            </span>
                          )}
                          <Badge variant="default" className="capitalize bg-secondary/20 text-secondary border-secondary/30 hover:bg-secondary/30 transition-colors text-xs px-2 py-0.5">
                            {checkIn.method || "visit"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-xl bg-secondary/5 border border-secondary/10 mb-3">
                    <Activity className="h-6 w-6 text-secondary/50" />
                  </div>
                  <p className="text-muted/70 font-medium text-sm">No check-ins yet</p>
                  <p className="text-xs text-muted/50 mt-1">
                    Activity will appear here once the member visits the gym
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Services & Bookings Section - Full Width */}
      <div className="space-y-6">
        <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <CardHeader className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Activity className="h-5 w-5 text-primary/60 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                    Services & Bookings
                  </CardTitle>
                  <p className="text-sm text-muted/70 mt-1">Purchased services and session bookings</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-500/30 bg-green-500/10">
                  {memberPurchasedServices.length} Purchases
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-500/30 bg-blue-500/10">
                  {memberBookings.length} Bookings
                </Badge>
              </div>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-8 pt-0">
            {/* Central Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
              </div>
              <div className="relative flex justify-center">
                <div className="px-4 py-2 bg-card rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-400/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-400/80"></div>
                    <span className="text-xs font-medium text-cyan-400/90 uppercase tracking-wider">Services Overview</span>
                    <div className="w-2 h-2 rounded-full bg-cyan-400/80"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 relative">
              {/* Central Vertical Divider */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/40 to-transparent transform -translate-x-1/2"></div>
              
              {/* Purchased Services */}
              <div className="space-y-4">
                
                <div className="space-y-3 max-h-120 overflow-y-auto">
                  {memberPurchasedServices.length > 0 ? (
                    memberPurchasedServices.map((service) => (
                      <div
                        key={service.id}
                        className="group relative rounded-2xl bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:bg-card/90"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10">
                              <Package className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-text group-hover:text-primary transition-colors truncate">
                                {service.service?.name || 'Service Package'}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted/60">Purchased</span>
                                <div className="w-1 h-1 rounded-full bg-muted/40"></div>
                                <span className="text-xs font-medium text-text">
                                  {formatDate(service.purchase_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-primary mb-1">
                              {service.service?.price || '0'} <span className="text-sm font-medium">RON</span>
                            </p>
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium ${
                                service.status === 'approved' 
                                  ? 'border-green-500/40 text-green-600 bg-green-500/10' 
                                  : service.status === 'pending'
                                  ? 'border-yellow-500/40 text-yellow-600 bg-yellow-500/10'
                                  : 'border-red-500/40 text-red-600 bg-red-500/10'
                              }`}
                            >
                              {service.status}
                            </Badge>
                          </div>
                        </div>
                        
                        
                        {service.sessions_remaining !== null && (
                          <div className="flex items-center justify-between mt-3 p-3 rounded-xl bg-gradient-to-r from-surface/20 to-surface/10">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                              <span className="text-xs font-medium text-muted/70">Sessions Progress</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold text-text">
                                {service.sessions_remaining} / {service.sessions_total}
                              </span>
                              <p className="text-xs text-muted/60">remaining</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Show membership plan if exists */}
                      {member.plan_name && (
                        <div className="group relative rounded-2xl bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:bg-card/90">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10">
                                <CreditCard className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-text group-hover:text-primary transition-colors">
                                  {member.plan_name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-muted/60">Active since</span>
                                  <span className="text-xs font-medium text-text">
                                    {formatDate(member.created_at)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="text-xs font-medium border-green-500/40 text-green-600 bg-green-500/10"
                            >
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {memberPurchasedServices.length === 0 && !member.plan_name && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-surface/20 to-surface/10 border border-surface/30 mb-4">
                            <ShoppingBag className="h-8 w-8 text-muted/50" />
                          </div>
                          <h4 className="font-medium text-text mb-1">No Services Purchased</h4>
                          <p className="text-sm text-muted/60">Service purchases will appear here</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Service Bookings */}
              <div className="space-y-4">
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {memberBookings.length > 0 ? (
                    memberBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="group relative rounded-2xl bg-card/80 backdrop-blur-sm p-4 transition-all duration-300 hover:shadow-lg hover:shadow-secondary/5 hover:bg-card/90"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-secondary/15 to-secondary/10">
                              <Calendar className="h-4 w-4 text-secondary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-text group-hover:text-secondary transition-colors truncate">
                                {booking.service?.name || 'Service Booking'}
                              </h4>
                              <div className="grid grid-cols-1 gap-2 mt-3">
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/20">
                                  <Calendar className="h-3 w-3 text-secondary/60" />
                                  <span className="text-xs font-medium text-text">
                                    {formatDate(booking.booking_date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded-lg bg-surface/20">
                                  <Clock className="h-3 w-3 text-secondary/60" />
                                  <span className="text-xs font-medium text-text">
                                    {new Date(booking.booking_date).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                    })}
                                  </span>
                                  <div className="ml-auto flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-secondary/40"></div>
                                    <span className="text-xs text-muted/60">
                                      {booking.service?.duration_minutes || 'N/A'} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <Badge 
                              variant="outline" 
                              className={`text-xs font-medium mb-2 ${
                                booking.status === 'confirmed' 
                                  ? 'border-green-500/40 text-green-600 bg-green-500/10' 
                                  : booking.status === 'pending'
                                  ? 'border-yellow-500/40 text-yellow-600 bg-yellow-500/10'
                                  : booking.status === 'completed'
                                  ? 'border-blue-500/40 text-blue-600 bg-blue-500/10'
                                  : 'border-red-500/40 text-red-600 bg-red-500/10'
                              }`}
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-surface/20 to-surface/10 border border-surface/30 mb-4">
                        <CalendarCheck className="h-8 w-8 text-muted/50" />
                      </div>
                      <h4 className="font-medium text-text mb-1">No Bookings Scheduled</h4>
                      <p className="text-sm text-muted/60">Service bookings will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Timeline Section */}
      <div className="space-y-6">
        {/* Member Timeline Card */}
        <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-secondary/10 hover:border-secondary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/2 via-secondary/1 to-primary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <CardHeader className="relative p-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Clock className="h-5 w-5 text-secondary/60 group-hover:text-secondary transition-colors" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-text group-hover:text-secondary transition-colors">
                    Member Timeline
                  </CardTitle>
                  <p className="text-sm text-muted/70 mt-1">Account history and important milestones</p>
                </div>
              </div>
              <Badge variant="outline" className="text-secondary border-secondary/30 bg-secondary/10">
                {memberAuditLogs.length} Events
              </Badge>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-6 pt-0">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {/* Key Milestones */}
              <div className="group/item relative rounded-xl bg-gradient-to-r from-green-500/5 to-green-500/10 border border-green-500/20 p-4 transition-all duration-200 hover:from-green-500/10 hover:to-green-500/15">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <UserCheck className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-text">Account Created</p>
                    <p className="text-sm text-muted/60">
                      {formatDate(member.created_at)} • Welcome to MituGym!
                    </p>
                  </div>
                </div>
              </div>
              
              {member.plan_name && (
                <div className="group/item relative rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20 p-4 transition-all duration-200 hover:from-blue-500/10 hover:to-blue-500/15">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Package className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-text">Plan Subscribed</p>
                      <p className="text-sm text-muted/60">
                        {formatDate(member.starts_at || member.created_at)} • {member.plan_name}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {recentCheckIns.length > 0 && (
                <div className="group/item relative rounded-xl bg-gradient-to-r from-purple-500/5 to-purple-500/10 border border-purple-500/20 p-4 transition-all duration-200 hover:from-purple-500/10 hover:to-purple-500/15">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                      <Activity className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-text">First Check-in</p>
                      <p className="text-sm text-muted/60">
                        {formatDate(recentCheckIns[recentCheckIns.length - 1]?.checked_in_at)} • Started gym activities
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Real Audit Log Events */}
              {memberAuditLogs.map((log) => (
                <div key={log.id} className="group/item relative rounded-xl bg-gradient-to-r from-surface/60 to-surface/40 border border-surface/30 p-4 transition-all duration-200 hover:from-surface/80 hover:to-surface/60">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface/40">
                      <Clock className="h-4 w-4 text-muted" />
                    </div>
                    <div>
                      <p className="font-medium text-text capitalize">
                        {log.action.replace('.', ' ').replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted/60">
                        {formatDate(log.created_at)} • {log.actor_name || 'System'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {member.expires_at && (
                <div className={`group/item relative rounded-xl p-4 transition-all duration-200 ${
                  isExpired 
                    ? 'bg-gradient-to-r from-red-500/5 to-red-500/10 border border-red-500/20 hover:from-red-500/10 hover:to-red-500/15'
                    : 'bg-gradient-to-r from-yellow-500/5 to-yellow-500/10 border border-yellow-500/20 hover:from-yellow-500/10 hover:to-yellow-500/15'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isExpired ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                      <AlertCircle className={`h-4 w-4 ${isExpired ? 'text-red-500' : 'text-yellow-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-text">
                        {isExpired ? 'Membership Expired' : 'Membership Expires'}
                      </p>
                      <p className="text-sm text-muted/60">
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