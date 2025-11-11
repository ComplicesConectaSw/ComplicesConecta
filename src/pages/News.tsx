import React from 'react';
import HeaderNav from '@/components/HeaderNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { DecorativeHearts } from '@/components/DecorativeHearts';
import { 
  ArrowLeft, 
  Calendar, 
  Star, 
  Zap, 
  Shield, 
  Users,
  Database,
  Palette,
  BarChart3,
  Bell,
  MessageSquare,
  Brain,
  TrendingUp,
  Rocket,
  CheckCircle2,
  Sparkles,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';

const News: React.FC = () => {
  const navigate = useNavigate();

  const versionUpdates = [
    {
      version: "v3.5.0",
      date: "05 Nov 2025",
      title: "Features Innovadoras + Neo4j Operativo + Documentación Consolidada",
      type: "major",
      icon: <Brain className="h-6 w-6" />,
      highlights: [
        "✅ Verificador IA de Consentimiento en Chats - Servicio + Migración + Integración",
        "✅ Galerías NFT-Verificadas - Servicio + Migración + UI completa",
        "✅ Matching Predictivo con Graphs Sociales - Neo4j + IA integrado",
        "✅ Eventos Virtuales Sostenibles con Tokens - Servicio completo",
        "✅ Neo4j Graph Database 100% operativo - Docker + Scripts + Sincronización",
        "✅ Documentación consolidada - DOCUMENTACION_CONSOLIDADA_MAESTRA_v3.5.0.md",
        "✅ Guía de instalación completa - INSTALACION_SETUP_v3.5.0.md",
        "✅ 107 tablas en base de datos - 122 políticas RLS activas",
        "✅ Tests: 260 passed | 14 skipped - 100% pasando",
        "✅ TypeScript: 0 errores - ESLint: 0 errores críticos"
      ],
      color: "from-purple-500 via-pink-500 to-blue-600",
      stats: {
        tablas: 107,
        features: "4 innovadoras",
        neo4j: "100% operativo"
      }
    },
    {
      version: "v3.5.0",
      date: "31 Oct 2025",
      title: "AI-Native Layer + Google S2 Geosharding",
      type: "major",
      icon: <TrendingUp className="h-6 w-6" />,
      highlights: [
        "ML-Powered Compatibility Scoring - Modelo 400K parmetros con PyTorch/TensorFlow.js",
        "Chat Summaries ML - GPT-4, BART (HuggingFace gratis), Fallback sin ML",
        "Google S2 Geosharding implementado - Cell ID generation (niveles 10-20)",
        "Database Migration - s2_cell_id y s2_level agregados a profiles",
        "Backfill Script preparado - Batch processing (100 perfiles/vez)",
        "Mejoras de performance esperadas: 50-100x ms rpido en queries geogrficas",
        "AI Model Metrics - Seguimiento completo de predicciones ML"
      ],
      color: "from-blue-500 to-cyan-600",
      stats: {
        tablas: 107,
        performance: "50-100x mejora",
        aiModels: "2 modelos activos"
      }
    },
    {
      version: "v3.4.1",
      date: "30 Oct 2025",
      title: "Sistema de Monitoreo y Analytics Completo",
      type: "major",
      icon: <BarChart3 className="h-6 w-6" />,
      highlights: [
        "Performance Monitoring Service - Mtricas Web Vitals (LCP, FCP, FID, CLS, TTFB)",
        "Error Alert Service - Captura automtica con categorizacin inteligente",
        "Analytics Dashboard - 4 pestaas (Overview, Moderacin, Histrico, Configuracin)",
        "Historical Charts con Recharts - Line, Area, Composed, Bar charts",
        "Sistema de Webhooks - Slack, Discord, Custom con rate limiting",
        "Integracin Sentry completa - Error tracking + Source maps + Session Replay",
        "New Relic APM - Infrastructure + Browser agent integrado",
        "Moderation Metrics - 7 KPIs completos con grficos de distribucin"
      ],
      color: "from-green-500 to-emerald-600",
      stats: {
        tablas: 107,
        coverage: "98% tests",
        qa: "96/100 puntuacin"
      }
    },
    {
      version: "v3.3.0",
      date: "23 Sep 2025",
      title: "Dashboard Administrativo y Monitoreo Avanzado",
      type: "major",
      icon: <BarChart3 className="h-6 w-6" />,
      highlights: [
        "Dashboard administrativo completo con 6 subpaneles modulares",
        "Sistema de monitoreo de performance en tiempo real",
        "Analytics avanzados de tokens CMPX/GTK",
        "Sistema de notificaciones push con Firebase FCM",
        "Seguridad avanzada con 2FA y fraud detection"
      ],
      color: "from-blue-500 to-purple-600"
    },
    {
      version: "v3.0.0",
      date: "21 Sep 2025", 
      title: "Sistema de Temas y Optimizacin Android",
      type: "major",
      icon: <Palette className="h-6 w-6" />,
      highlights: [
        "5 temas nicos personalizables (Light, Dark, Elegant, Modern, Vibrant)",
        "Seleccin de tema durante registro con modal interactivo",
        "Optimizacin completa para Android con Material Design",
        "LazyImageLoader con deteccin WebP/AVIF",
        "Reduccin 30% en tiempo de carga inicial"
      ],
      color: "from-purple-500 to-pink-600"
    },
    {
      version: "v2.1.8",
      date: "14 Ene 2025",
      title: "Geolocalizacin y Matches Inteligentes",
      type: "major",
      icon: <Users className="h-6 w-6" />,
      highlights: [
        "Sistema de geolocalizacin con frmula de Haversine",
        "Filtros por proximidad: 'Muy cerca' (=5km), 'En tu zona' (=15km)",
        "Algoritmo de compatibilidad con scoring inteligente",
        "Chat en tiempo real optimizado con Supabase Realtime",
        "Privacidad de ubicacin configurable"
      ],
      color: "from-green-500 to-teal-600"
    },
    {
      version: "v2.1.0 - v2.1.7",
      date: "11-13 Ene 2025",
      title: "Consolidacin y Estabilidad",
      type: "minor",
      icon: <Shield className="h-6 w-6" />,
      highlights: [
        "Sistema de tokens CMPX/GTK completamente funcional",
        "Auditora DevOps completa con puntuacin 96/100",
        "Navegacin unificada y responsiva",
        "Configuracin de storage buckets y funciones de BD",
        "Correccin de errores TypeScript crticos"
      ],
      color: "from-orange-500 to-red-600"
    },
    {
      version: "v1.0 - v2.0",
      date: "Dic 2024 - Ene 2025",
      title: "Fundacin y Arquitectura Base",
      type: "foundation",
      icon: <Database className="h-6 w-6" />,
      highlights: [
        "Arquitectura base con React + TypeScript + Supabase",
        "Sistema de autenticacin y perfiles (single/pareja)",
        "Base de datos con RLS y polticas de seguridad",
        "UI/UX inicial con Tailwind CSS",
        "Funcionalidades core: matches, chat, galera"
      ],
      color: "from-gray-500 to-slate-600"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'major': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30';
      case 'minor': return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30';
      case 'foundation': return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'major': return 'Actualizacin Mayor';
      case 'minor': return 'Mejoras y Correcciones';
      case 'foundation': return 'Versin Fundacional';
      default: return 'Actualizacin';
    }
  };

  const stats = {
    funcionalidades: 54,
    versiones: 16,
    typescript: 100,
    qa: 96,
    tablas: 107,
    rls: 122,
    indices: 209,
    triggers: 35
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 relative overflow-hidden">
      {/* Background decorativo */}
      <DecorativeHearts count={8} />
      
      <HeaderNav />
      
      {/* Page Header con glassmorphism mejorado */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-gradient-to-r from-purple-900/95 via-purple-800/95 to-blue-900/95 backdrop-blur-xl border-b border-purple-500/30 p-4 sm:p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            className="text-white hover:bg-white/10 flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Regresar</span>
          </Button>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-purple-300 animate-pulse" />
            Novedades y Actualizaciones
          </h1>
          
          <div className="w-16 sm:w-20" />
        </div>
      </motion.div>

      {/* Content con animaciones */}
      <div className="relative z-10 max-w-6xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
        {/* Introduccin mejorada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Evolucin Continua de ComplicesConecta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/90 leading-relaxed text-base sm:text-lg">
                Descubre todas las mejoras, nuevas funcionalidades y optimizaciones que hemos implementado 
                desde el lanzamiento de ComplicesConecta. Cada actualizacin est diseada para mejorar 
                tu experiencia, la seguridad de la plataforma y el rendimiento del sistema.
              </p>
              
              {/* Badges de estado */}
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Production Ready
                </Badge>
                <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-400/30">
                  <Rocket className="h-3 w-3 mr-1" />
                  AI-Native
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30">
                  <Shield className="h-3 w-3 mr-1" />
                  Enterprise Grade
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline de Versiones mejorado */}
        <div className="space-y-6">
          {versionUpdates.map((update, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/15 hover:border-purple-400/30 transition-all duration-300 shadow-xl hover:shadow-2xl group">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    {/* Icon con animacin */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={`p-4 rounded-xl bg-gradient-to-r ${update.color} text-white flex-shrink-0 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300`}
                    >
                      {update.icon}
                    </motion.div>
                    
                    {/* Content */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {update.title}
                        </h3>
                        <Badge className={getTypeColor(update.type)}>
                          {getTypeLabel(update.type)}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4 text-white/70">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm sm:text-base font-medium">{update.date}</span>
                        </div>
                        <Badge className="border-white/30 text-white border bg-white/10 backdrop-blur-sm font-semibold">
                          {update.version}
                        </Badge>
                        {update.stats && (
                          <>
                            <Badge variant="outline" className="border-purple-400/30 text-purple-300 bg-purple-500/10">
                              {update.stats.tablas} tablas
                            </Badge>
                            {update.stats.performance && (
                              <Badge variant="outline" className="border-blue-400/30 text-blue-300 bg-blue-500/10">
                                {update.stats.performance}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white/90 text-base sm:text-lg flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          Principales novedades:
                        </h4>
                        <ul className="space-y-2.5">
                          {update.highlights.map((highlight, idx) => (
                            <motion.li
                              key={idx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + index * 0.1 + idx * 0.05 }}
                              className="flex items-start gap-3 text-white/85 text-sm sm:text-base leading-relaxed group/item"
                            >
                              <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform duration-300" />
                              <span className="flex-1">{highlight}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Estadsticas de Desarrollo mejoradas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                Estadsticas de Desarrollo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 sm:p-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl border border-pink-400/30 hover:border-pink-400/50 transition-all duration-300"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-pink-300 mb-2">{stats.funcionalidades}+</div>
                  <div className="text-sm sm:text-base text-white/70">Funcionalidades</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 sm:p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-purple-300 mb-2">{stats.versiones}+</div>
                  <div className="text-sm sm:text-base text-white/70">Versiones</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-blue-300 mb-2">{stats.typescript}%</div>
                  <div className="text-sm sm:text-base text-white/70">TypeScript</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 hover:border-green-400/50 transition-all duration-300"
                >
                  <div className="text-2xl sm:text-3xl font-bold text-green-300 mb-2">{stats.qa}/100</div>
                  <div className="text-sm sm:text-base text-white/70">Puntuacin QA</div>
                </motion.div>
              </div>
              
              {/* Estadsticas adicionales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-6">
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.tablas}</div>
                  <div className="text-xs sm:text-sm text-white/70">Tablas DB</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.rls}+</div>
                  <div className="text-xs sm:text-sm text-white/70">Polticas RLS</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.indices}+</div>
                  <div className="text-xs sm:text-sm text-white/70">ndices</div>
                </div>
                <div className="text-center p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="text-xl sm:text-2xl font-bold text-white mb-1">{stats.triggers}</div>
                  <div className="text-xs sm:text-sm text-white/70">Triggers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Prximas Actualizaciones mejoradas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Card className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                Prximas Actualizaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Integracin MongoDB Atlas para analytics avanzados",
                  "Sistema de video chat P2P con WebRTC",
                  "Marketplace de productos premium",
                  "Notificaciones push nativas mejoradas",
                  "Expansin internacional (ms pases)",
                  "App iOS nativa para iPhone y iPad"
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-white/90 text-sm sm:text-base">{item}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action mejorado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center pt-6"
        >
          <Card className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-xl border-purple-400/30 shadow-2xl">
            <CardContent className="p-8">
              <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Tienes Feedback o Sugerencias?
              </h3>
              <p className="text-white/80 text-base sm:text-lg mb-6">
                Tu opinin es valiosa para nosotros. Aydanos a mejorar ComplicesConecta compartiendo tus ideas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate('/support')}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contactar Soporte
                </Button>
                <Button
                  onClick={() => navigate('/about')}
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-3 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Conocer Ms
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default News;
