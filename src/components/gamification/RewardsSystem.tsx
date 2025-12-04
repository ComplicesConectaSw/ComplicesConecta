/**
 * =====================================================
 * REWARDS & GAMIFICATION SYSTEM
 * =====================================================
 * Sistema de recompensas, badges, y niveles
 * Fecha: 19 Nov 2025
 * Versión: v3.6.5
 * =====================================================
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Gift, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RewardsSystemProps {
  userId: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'social' | 'activity' | 'milestone' | 'special';
  points: number;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number; // 0-100
  requirement: string;
}

interface UserLevel {
  current: number;
  next: number;
  progress: number; // 0-100
  totalPoints: number;
  pointsToNext: number;
  title: string;
}

const _LEVELS = [
  { level: 1, points: 0, title: 'Novato' },
  { level: 2, points: 100, title: 'Explorador' },
  { level: 3, points: 300, title: 'Sociable' },
  { level: 4, points: 600, title: 'Popular' },
  { level: 5, points: 1000, title: 'Influencer' },
  { level: 6, points: 1500, title: 'Leyenda' },
  { level: 7, points: 2500, title: 'Maestro' },
  { level: 8, points: 4000, title: 'Élite' },
  { level: 9, points: 6000, title: 'Campeón' },
  { level: 10, points: 10000, title: 'Ícono' }
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Primera Conexión',
    description: 'Haz tu primer match',
    icon: '💫',
    category: 'milestone',
    points: 10,
    unlocked: true,
    unlockedAt: new Date('2025-11-01'),
    requirement: '1 match'
  },
  {
    id: '2',
    title: 'Conversador',
    description: 'Envía 50 mensajes',
    icon: '💬',
    category: 'social',
    points: 25,
    unlocked: true,
    unlockedAt: new Date('2025-11-10'),
    requirement: '50 mensajes'
  },
  {
    id: '3',
    title: 'Popular',
    description: 'Recibe 100 visitas a tu perfil',
    icon: '👁️',
    category: 'milestone',
    points: 30,
    unlocked: true,
    progress: 78,
    requirement: '100 visitas (78/100)'
  },
  {
    id: '4',
    title: 'Racha de Fuego',
    description: 'Activo 7 días consecutivos',
    icon: '🔥',
    category: 'activity',
    points: 50,
    unlocked: false,
    progress: 57,
    requirement: '7 días seguidos (4/7)'
  },
  {
    id: '5',
    title: 'Encantador',
    description: 'Recibe 50 likes',
    icon: '💖',
    category: 'social',
    points: 40,
    unlocked: false,
    progress: 62,
    requirement: '50 likes (31/50)'
  },
  {
    id: '6',
    title: 'Verificado',
    description: 'Verifica tu perfil',
    icon: '✅',
    category: 'milestone',
    points: 75,
    unlocked: true,
    unlockedAt: new Date('2025-11-05'),
    requirement: 'Verificación completa'
  },
  {
    id: '7',
    title: 'VIP',
    description: 'Suscríbete a Premium',
    icon: '👑',
    category: 'special',
    points: 100,
    unlocked: false,
    requirement: 'Membresía Premium'
  },
  {
    id: '8',
    title: 'Matchmaker',
    description: 'Consigue 25 matches',
    icon: '💕',
    category: 'milestone',
    points: 60,
    unlocked: false,
    progress: 44,
    requirement: '25 matches (11/25)'
  },
  {
    id: '9',
    title: 'Completista',
    description: 'Completa tu perfil al 100%',
    icon: '📝',
    category: 'milestone',
    points: 35,
    unlocked: true,
    unlockedAt: new Date('2025-11-02'),
    requirement: 'Perfil completo'
  },
  {
    id: '10',
    title: 'Social Butterfly',
    description: 'Únete a 5 grupos',
    icon: '🦋',
    category: 'social',
    points: 45,
    unlocked: false,
    progress: 20,
    requirement: '5 grupos (1/5)'
  }
];

export const RewardsSystem: React.FC<RewardsSystemProps> = ({ userId }) => {
  const [achievements] = useState<Achievement[]>(MOCK_ACHIEVEMENTS);
  const [userLevel] = useState<UserLevel>({
    current: 3,
    next: 4,
    progress: 65,
    totalPoints: 490,
    pointsToNext: 110,
    title: 'Sociable'
  });
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<Achievement['category'] | 'all'>('all');

  useEffect(() => {
    loadUserProgress();
  }, [userId]);

  const loadUserProgress = async () => {
    // TODO: En producción, cargar desde API
    // Ya tiene datos mock
  };

  const filteredAchievements = achievements.filter(achievement => {
    const matchesUnlocked = filter === 'all' || 
      (filter === 'unlocked' && achievement.unlocked) ||
      (filter === 'locked' && !achievement.unlocked);
    
    const matchesCategory = categoryFilter === 'all' || achievement.category === categoryFilter;
    
    return matchesUnlocked && matchesCategory;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Recompensas & Logros
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Completa desafíos y gana puntos para subir de nivel
        </p>
      </div>

      {/* Level Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="h-6 w-6" />
                  <span className="text-2xl font-bold">Nivel {userLevel.current}</span>
                </div>
                <p className="text-white/80 text-sm">{userLevel.title}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{totalPoints}</div>
                <p className="text-white/80 text-sm">puntos totales</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso al Nivel {userLevel.next}</span>
                <span>{userLevel.pointsToNext} puntos más</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${userLevel.progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="bg-white h-full rounded-full"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{unlockedCount}/{achievements.length}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Logros Desbloqueados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalPoints}</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Puntos Ganados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.floor(userLevel.progress)}%</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Próximo Nivel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-2">
          {(['all', 'unlocked', 'locked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {f === 'all' && 'Todos'}
              {f === 'unlocked' && `Desbloqueados (${unlockedCount})`}
              {f === 'locked' && `Bloqueados (${achievements.length - unlockedCount})`}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {(['all', 'social', 'activity', 'milestone', 'special'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' && 'Todas'}
              {cat === 'social' && 'Social'}
              {cat === 'activity' && 'Actividad'}
              {cat === 'milestone' && 'Hitos'}
              {cat === 'special' && 'Especiales'}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`relative overflow-hidden ${
              achievement.unlocked
                ? 'border-yellow-400 dark:border-yellow-600'
                : 'opacity-70'
            }`}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`text-4xl ${!achievement.unlocked && 'grayscale'}`}>
                    {achievement.unlocked ? achievement.icon : <Lock className="h-10 w-10 text-gray-400" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold">{achievement.title}</h3>
                      {achievement.unlocked && (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {achievement.description}
                    </p>
                    
                    {/* Category & Points */}
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {achievement.category}
                      </Badge>
                      <span className="text-xs font-medium text-purple-500">
                        +{achievement.points} pts
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <Progress value={achievement.progress} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {achievement.requirement}
                        </p>
                      </div>
                    )}

                    {/* Unlocked Date */}
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Desbloqueado el {achievement.unlockedAt.toLocaleDateString('es-MX')}
                      </p>
                    )}

                    {/* Requirement */}
                    {!achievement.unlocked && achievement.progress === undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.requirement}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>

              {/* Unlocked Badge */}
              {achievement.unlocked && (
                <div className="absolute top-2 right-2">
                  <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    ✓ DESBLOQUEADO
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No hay logros en esta categoría
        </div>
      )}
    </div>
  );
};

export default RewardsSystem;

