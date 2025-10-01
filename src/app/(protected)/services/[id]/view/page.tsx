import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Briefcase, Edit, Banknote, Clock, Calendar, CheckCircle, XCircle, Users, FileText } from "lucide-react";
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
    <div className="space-y-8">
      {/* Modern Header with Status */}
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-3xl blur-2xl"></div>
        
        <div className="relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-2xl shadow-black/20 transition-all duration-300 hover:shadow-3xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                    <Briefcase className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-text">{service.name}</h1>
                  <p className="text-muted/70 mt-1">Service Details</p>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge 
                      variant={service.is_active ? 'default' : 'secondary'} 
                      className={`${
                        service.is_active 
                          ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                          : 'bg-red-500/20 text-red-600 border-red-500/30'
                      }`}
                    >
                      {service.is_active ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                      {typeLabels[service.service_type as keyof typeof typeLabels] || service.service_type}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/services/${service.id}/edit`}>
                  <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl">
                    <Edit className="h-4 w-4" />
                    Edit Service
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Services
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Banknote className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Price</p>
                    <p className="text-2xl font-bold text-text">{formatCurrency(service.price)}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Duration</p>
                    <p className="text-2xl font-bold text-text">{service.duration_minutes} min</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Users className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Sessions</p>
                    <p className="text-2xl font-bold text-text">{service.max_sessions || 1}</p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/5 to-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-500/20">
                    <Calendar className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted/70">Booking</p>
                    <p className="text-lg font-bold text-text">
                      {service.requires_advance_booking ? `${service.advance_booking_hours}h` : 'No advance'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details Card */}
      <div className="grid lg:grid-cols-1 gap-8">
        <Card className="group relative bg-card/95 backdrop-blur-xl border border-surface/40 shadow-xl shadow-black/15 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/50 overflow-hidden rounded-3xl">
          {/* Card Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/2 via-primary/1 to-secondary/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
          
          <CardHeader className="relative p-8 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-6 w-6 text-primary/60 group-hover:text-primary transition-colors" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-text group-hover:text-primary transition-colors">
                  Service Information
                </CardTitle>
                <p className="text-sm text-muted/70 mt-1">Detailed service configuration and settings</p>
              </div>
            </div>
          </CardHeader>
            
          <CardContent className="relative p-8 pt-0">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Basic Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Service Name</p>
                      <p className="text-text font-semibold">{service.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Briefcase className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Service Type</p>
                      <p className="text-text font-semibold">
                        {typeLabels[service.service_type as keyof typeof typeLabels] || service.service_type}
                      </p>
                    </div>
                  </div>

                  {service.session_type && (
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                      <Users className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted/70">Session Type</p>
                        <p className="text-text font-semibold">{service.session_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Banknote className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Price</p>
                      <p className="text-text font-semibold">{formatCurrency(service.price)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Duration</p>
                      <p className="text-text font-semibold">{service.duration_minutes} minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings & Configuration */}
              <div className="space-y-6">
                <h3 className="text-sm font-semibold text-text uppercase tracking-wider">Settings & Configuration</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Users className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Max Sessions</p>
                      <p className="text-text font-semibold">{service.max_sessions || 1} session{(service.max_sessions || 1) > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted/70">Advance Booking</p>
                      <p className="text-text font-semibold">
                        {service.requires_advance_booking 
                          ? `Required (${service.advance_booking_hours} hours)` 
                          : 'Not required'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-muted/70">Status</p>
                      <Badge 
                        variant={service.is_active ? 'default' : 'secondary'} 
                        className={`w-fit ${
                          service.is_active 
                            ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                            : 'bg-red-500/20 text-red-600 border-red-500/30'
                        }`}
                      >
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>

                  {service.description && (
                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface/20 border border-surface/30 hover:bg-surface/30 transition-colors">
                      <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted/70">Description</p>
                        <p className="text-text font-medium mt-1 leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
