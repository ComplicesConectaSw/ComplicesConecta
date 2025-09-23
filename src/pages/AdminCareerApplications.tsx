import { useState, useEffect } from "react";
import { ArrowLeft, Download, Eye, Filter, Search, Users, Calendar, FileText, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

interface CareerApplication {
  id: string;
  created_at: string;
  nombre: string;
  telefono: string;
  correo: string;
  domicilio?: string;
  puesto: string;
  experiencia: string;
  referencias?: string;
  expectativas: string;
  cv_url?: string;
  status: 'pending' | 'reviewing' | 'contacted' | 'accepted' | 'rejected';
  user_agent?: string;
}

const AdminCareerApplications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [puestoFilter, setPuestoFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<CareerApplication | null>(null);

  const statusColors = {
    pending: 'bg-yellow-500',
    reviewing: 'bg-blue-500',
    contacted: 'bg-purple-500',
    accepted: 'bg-green-500',
    rejected: 'bg-red-500'
  };

  const statusLabels = {
    pending: 'Pendiente',
    reviewing: 'Revisando',
    contacted: 'Contactado',
    accepted: 'Aceptado',
    rejected: 'Rechazado'
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      logger.info('📋 Cargando solicitudes de carrera...');

      const { data, error } = await (supabase as any)
        .from('career_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('❌ Error al cargar solicitudes:', { error: error.message });
        toast({
          variant: "destructive",
          title: "Error al cargar solicitudes",
          description: error.message
        });
        return;
      }

      setApplications(data || []);
      logger.info('✅ Solicitudes cargadas exitosamente:', { count: data?.length || 0 });

    } catch (error: any) {
      logger.error('❌ Error inesperado:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "No se pudieron cargar las solicitudes"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, newStatus: string) => {
    try {
      logger.info('🔄 Actualizando status de solicitud:', { id, newStatus });

      const { error } = await (supabase as any)
        .from('career_applications')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        logger.error('❌ Error al actualizar status:', { error: error.message });
        toast({
          variant: "destructive",
          title: "Error al actualizar",
          description: error.message
        });
        return;
      }

      // Actualizar estado local
      setApplications(prev => 
        prev.map(app => 
          app.id === id ? { ...app, status: newStatus as any } : app
        )
      );

      toast({
        title: "Status actualizado",
        description: `Solicitud marcada como ${statusLabels[newStatus as keyof typeof statusLabels]}`
      });

      logger.info('✅ Status actualizado exitosamente');

    } catch (error: any) {
      logger.error('❌ Error inesperado al actualizar:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "No se pudo actualizar el status"
      });
    }
  };

  const downloadCV = async (cvUrl: string, applicantName: string) => {
    try {
      logger.info('📥 Descargando CV:', { cvUrl, applicantName });

      const { data, error } = await supabase.storage
        .from('career-files')
        .download(cvUrl);

      if (error) {
        logger.error('❌ Error al descargar CV:', { error: error.message });
        toast({
          variant: "destructive",
          title: "Error al descargar",
          description: error.message
        });
        return;
      }

      // Crear URL de descarga
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${applicantName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "CV descargado",
        description: `CV de ${applicantName} descargado exitosamente`
      });

      logger.info('✅ CV descargado exitosamente');

    } catch (error: any) {
      logger.error('❌ Error inesperado al descargar:', { error: error.message });
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "No se pudo descargar el CV"
      });
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.puesto.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesPuesto = puestoFilter === 'all' || app.puesto === puestoFilter;
    
    return matchesSearch && matchesStatus && matchesPuesto;
  });

  const uniquePuestos = [...new Set(applications.map(app => app.puesto))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="h-6 w-6" />
              Panel de Administración - Solicitudes de Carrera
            </h1>
            <div className="flex items-center gap-2 text-white">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {applications.length} Total
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto p-6">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-white">Buscar</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Nombre, email o puesto..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Estado</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="reviewing">Revisando</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="accepted">Aceptado</SelectItem>
                      <SelectItem value="rejected">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Puesto</Label>
                  <Select value={puestoFilter} onValueChange={setPuestoFilter}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los puestos</SelectItem>
                      {uniquePuestos.map(puesto => (
                        <SelectItem key={puesto} value={puesto}>{puesto}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={fetchApplications}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Applications List */}
          <div className="grid gap-4">
            {filteredApplications.length === 0 ? (
              <Card className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-white/50 mx-auto mb-4" />
                  <p className="text-white/80">No se encontraron solicitudes con los filtros aplicados</p>
                </CardContent>
              </Card>
            ) : (
              filteredApplications.map((application) => (
                <Card key={application.id} className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg hover:bg-white/15 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{application.nombre}</h3>
                          <Badge className={`${statusColors[application.status]} text-white`}>
                            {statusLabels[application.status]}
                          </Badge>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-white/80">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{application.correo}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{application.telefono}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{application.puesto}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(application.created_at)}</span>
                          </div>
                          {application.domicilio && (
                            <div className="flex items-center gap-2 md:col-span-2">
                              <MapPin className="h-4 w-4" />
                              <span>{application.domicilio}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedApplication(application)}
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {application.cv_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadCV(application.cv_url!, application.nombre)}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={application.status === status ? "default" : "outline"}
                          onClick={() => updateApplicationStatus(application.id, status)}
                          className={`text-xs ${
                            application.status === status 
                              ? `${statusColors[status as keyof typeof statusColors]} text-white` 
                              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          }`}
                        >
                          {label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-2xl">
                  Detalle de Solicitud - {selectedApplication.nombre}
                </CardTitle>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedApplication(null)}
                  className="text-white hover:bg-white/10"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-white font-semibold mb-2">Información Personal</h4>
                  <div className="space-y-2 text-white/80">
                    <p><strong>Nombre:</strong> {selectedApplication.nombre}</p>
                    <p><strong>Email:</strong> {selectedApplication.correo}</p>
                    <p><strong>Teléfono:</strong> {selectedApplication.telefono}</p>
                    {selectedApplication.domicilio && (
                      <p><strong>Domicilio:</strong> {selectedApplication.domicilio}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">Información Profesional</h4>
                  <div className="space-y-2 text-white/80">
                    <p><strong>Puesto:</strong> {selectedApplication.puesto}</p>
                    <p><strong>Fecha:</strong> {formatDate(selectedApplication.created_at)}</p>
                    <p><strong>Estado:</strong> 
                      <Badge className={`ml-2 ${statusColors[selectedApplication.status]} text-white`}>
                        {statusLabels[selectedApplication.status]}
                      </Badge>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Experiencia</h4>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-white/80 whitespace-pre-wrap">{selectedApplication.experiencia}</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Expectativas</h4>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <p className="text-white/80 whitespace-pre-wrap">{selectedApplication.expectativas}</p>
                </div>
              </div>

              {selectedApplication.referencias && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Referencias</h4>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <p className="text-white/80 whitespace-pre-wrap">{selectedApplication.referencias}</p>
                  </div>
                </div>
              )}

              {selectedApplication.cv_url && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Curriculum Vitae</h4>
                  <Button
                    onClick={() => downloadCV(selectedApplication.cv_url!, selectedApplication.nombre)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CV
                  </Button>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-white/10">
                <h4 className="text-white font-semibold">Cambiar Estado:</h4>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={selectedApplication.status === status ? "default" : "outline"}
                    onClick={() => {
                      updateApplicationStatus(selectedApplication.id, status);
                      setSelectedApplication({...selectedApplication, status: status as any});
                    }}
                    className={`text-xs ${
                      selectedApplication.status === status 
                        ? `${statusColors[status as keyof typeof statusColors]} text-white` 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminCareerApplications;
