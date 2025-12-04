/**
 * =====================================================
 * ANALYTICS DASHBOARD
 * =====================================================
 * Dashboard de analíticas y estadísticas del usuario
 * Features: Charts, métricas en tiempo real, comparaciones
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Heart, Eye, MessageCircle, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface AnalyticsDashboardProps {
  userId: string;
  profileType: 'single' | 'couple';
}

interface Metrics {
  profileViews: {
    today: number;
    week: number;
    month: number;
    total: number;
    trend: number; // % cambio vs periodo anterior
  };
  likes: {
    received: number;
    sent: number;
    mutual: number;
    trend: number;
  };
  messages: {
    sent: number;
    received: number;
    conversations: number;
    avgResponseTime: number; // minutos
  };
  matches: {
    total: number;
    thisWeek: number;
    compatibility: number; // % promedio
  };
  engagement: {
    score: number; // 0-100
    activityLevel: 'low' | 'medium' | 'high';
    lastActive: Date;
  };
}

interface ChartData {
  label: string;
  value: number;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  userId,
  profileType
}) => {
  const [metrics, setMetrics] = useState<Metrics>({
    profileViews: {
      today: 0,
      week: 0,
      month: 0,
      total: 0,
      trend: 0
    },
    likes: {
      received: 0,
      sent: 0,
      mutual: 0,
      trend: 0
    },
    messages: {
      sent: 0,
      received: 0,
      conversations: 0,
      avgResponseTime: 0
    },
    matches: {
      total: 0,
      thisWeek: 0,
      compatibility: 0
    },
    engagement: {
      score: 0,
      activityLevel: 'medium',
      lastActive: new Date()
    }
  });

  const [viewsChart, setViewsChart] = useState<ChartData[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  /**
   * Cargar métricas
   */
  useEffect(() => {
    loadMetrics();
  }, [userId, timeRange]);

  const loadMetrics = async () => {
    // TODO: En producción, obtener desde API
    // Simulación de datos
    const mockMetrics: Metrics = {
      profileViews: {
        today: Math.floor(Math.random() * 50) + 10,
        week: Math.floor(Math.random() * 200) + 50,
        month: Math.floor(Math.random() * 800) + 200,
        total: Math.floor(Math.random() * 5000) + 1000,
        trend: (Math.random() * 40) - 10 // -10% a +30%
      },
      likes: {
        received: Math.floor(Math.random() * 100) + 20,
        sent: Math.floor(Math.random() * 80) + 15,
        mutual: Math.floor(Math.random() * 30) + 5,
        trend: (Math.random() * 50) - 15
      },
      messages: {
        sent: Math.floor(Math.random() * 150) + 30,
        received: Math.floor(Math.random() * 180) + 40,
        conversations: Math.floor(Math.random() * 20) + 5,
        avgResponseTime: Math.floor(Math.random() * 60) + 5
      },
      matches: {
        total: Math.floor(Math.random() * 50) + 10,
        thisWeek: Math.floor(Math.random() * 10) + 1,
        compatibility: Math.floor(Math.random() * 30) + 60
      },
      engagement: {
        score: Math.floor(Math.random() * 40) + 50,
        activityLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        lastActive: new Date()
      }
    };

    setMetrics(mockMetrics);

    // Chart data
    const mockChart: ChartData[] = [];
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      mockChart.push({
        label: date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }),
        value: Math.floor(Math.random() * 100) + 10
      });
    }

    setViewsChart(mockChart);
  };

  /**
   * Formatear números
   */
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  /**
   * Renderizar tendencia
   */
  const renderTrend = (trend: number) => {
    const isPositive = trend >= 0;
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        <TrendingUp className={`h-4 w-4 ${!isPositive && 'rotate-180'}`} />
        <span>{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  /**
   * Renderizar gráfico de barras simple
   */
  const renderSimpleChart = (data: ChartData[]) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const lastFew = data.slice(-7); // Últimos 7 días

    return (
      <div className="flex items-end gap-2 h-32">
        {lastFew.map((item, index) => (
          <div
            key={index}
            className="flex-1 flex flex-col items-center gap-1"
          >
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(item.value / maxValue) * 100}%` }}
              transition={{ delay: index * 0.1 }}
              className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg min-h-[20px]"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 rotate-45 origin-left">
              {item.label.split(' ')[0]}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard de Analíticas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Monitorea el rendimiento de tu perfil {profileType === 'couple' ? 'de pareja' : 'individual'}
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              timeRange === range
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {range === 'week' && 'Última Semana'}
            {range === 'month' && 'Último Mes'}
            {range === 'year' && 'Último Año'}
          </button>
        ))}
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Visitas al Perfil</CardTitle>
              <Eye className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.profileViews.total)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.profileViews.today} hoy • {metrics.profileViews.week} esta semana
              </p>
              <div className="mt-2">
                {renderTrend(metrics.profileViews.trend)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Likes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Likes</CardTitle>
              <Heart className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.likes.received)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.likes.mutual} mutuos • {metrics.likes.sent} enviados
              </p>
              <div className="mt-2">
                {renderTrend(metrics.likes.trend)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Messages */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
              <MessageCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.messages.received)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.messages.conversations} conversaciones activas
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Responde en ~{metrics.messages.avgResponseTime} min
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Matches</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(metrics.matches.total)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {metrics.matches.thisWeek} nuevos esta semana
              </p>
              <p className="text-xs text-purple-500 mt-1 font-medium">
                {metrics.matches.compatibility}% compatibilidad promedio
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Visitas a tu Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {renderSimpleChart(viewsChart)}
          </CardContent>
        </Card>
      </motion.div>

      {/* Engagement & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Nivel de Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score de Actividad</span>
                    <span className="text-2xl font-bold text-purple-500">
                      {metrics.engagement.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${metrics.engagement.score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nivel de Actividad</span>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    metrics.engagement.activityLevel === 'high'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : metrics.engagement.activityLevel === 'medium'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {metrics.engagement.activityLevel === 'high' && 'Alto'}
                    {metrics.engagement.activityLevel === 'medium' && 'Medio'}
                    {metrics.engagement.activityLevel === 'low' && 'Bajo'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-t dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Última actividad</span>
                  <span className="text-sm font-medium">Hace {Math.floor((Date.now() - metrics.engagement.lastActive.getTime()) / 60000)} min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Logros Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: '🔥', title: 'Racha de 7 días', desc: 'Activo todos los días esta semana' },
                  { icon: '💬', title: 'Conversador', desc: 'Iniciaste 10+ conversaciones' },
                  { icon: '⭐', title: 'Popular', desc: 'Recibiste 50+ visitas este mes' },
                  { icon: '💖', title: 'Encantador', desc: '25+ likes recibidos' }
                ].map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{achievement.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

