import React from 'react';
import { format, isSameDay, differenceInDays, differenceInMinutes, differenceInHours } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ClipboardList,
  Trophy,
  Flame,
  Star,
  Target,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';

interface Completion {
  id: string;
  title: string;
  timestamp: number;
}

interface StatsProps {
  completions: Completion[];
}

interface Achievement {
  icon: React.ReactNode;
  title: string;
  description: string;
  isUnlocked: boolean;
}

export const Stats = ({ completions }: StatsProps) => {
  // Calculate statistics
  const totalCompleted = completions.length;
  const uniqueTasks = new Set(completions.map(c => c.id)).size;
  
  // Calculate current and best streaks
  const calculateStreaks = () => {
    if (completions.length === 0) return { currentStreak: 0, bestStreak: 0 };
    
    const dates = completions
      .map(c => new Date(c.timestamp))
      .sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 1;
    let bestStreak = 1;
    let tempStreak = 1;
    
    // Calculate the average time difference between completions
    let totalDiff = 0;
    for (let i = 1; i < Math.min(dates.length, 10); i++) { // Use up to 10 recent completions
      const diffMinutes = differenceInMinutes(dates[i - 1], dates[i]);
      totalDiff += diffMinutes;
    }
    const avgDiffMinutes = totalDiff / Math.min(dates.length - 1, 9) || 0;
    
    // If average difference is less than 24 hours, we'll count streaks in hours
    const isShortInterval = avgDiffMinutes < 1440; // 24 hours in minutes
    
    for (let i = 1; i < dates.length; i++) {
      const diffMinutes = differenceInMinutes(dates[i - 1], dates[i]);
      
      // For short intervals (less than 24h average), consider it a streak if within 2x the average time
      // For longer intervals, use the traditional daily streak calculation
      const isStreak = isShortInterval
        ? diffMinutes <= avgDiffMinutes * 2
        : differenceInDays(dates[i - 1], dates[i]) <= 1;
      
      if (isStreak) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
        if (i === 1) currentStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    }
    
    return { 
      currentStreak, 
      bestStreak,
      isShortInterval 
    };
  };

  const { currentStreak, bestStreak, isShortInterval } = calculateStreaks();

  // Define achievements with adjusted thresholds for short intervals
  const achievements: Achievement[] = [
    {
      icon: <Trophy className="h-6 w-6 text-yellow-500" />,
      title: 'Первые шаги',
      description: 'Выполните первую задачу',
      isUnlocked: totalCompleted > 0,
    },
    {
      icon: <Flame className="h-6 w-6 text-orange-500" />,
      title: 'На волне',
      description: isShortInterval 
        ? 'Достигните серии из 3 выполнений подряд'
        : 'Достигните серии из 3 дней',
      isUnlocked: bestStreak >= 3,
    },
    {
      icon: <Star className="h-6 w-6 text-purple-500" />,
      title: 'Мастер дисциплины',
      description: 'Выполните 50 задач',
      isUnlocked: totalCompleted >= 50,
    },
    {
      icon: <Target className="h-6 w-6 text-blue-500" />,
      title: 'Многозадачность',
      description: 'Выполните 5 разных задач',
      isUnlocked: uniqueTasks >= 5,
    },
  ];

  // Helper function to format streak text
  const formatStreakText = (count: number) => {
    if (isShortInterval) {
      return `${count} подряд`;
    }
    return `${count} дн.`;
  };

  if (completions.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">История пуста</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Всего выполнено</h3>
          </div>
          <p className="text-2xl font-bold">{totalCompleted}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-green-500" />
            <h3 className="font-medium">Текущая серия</h3>
          </div>
          <p className="text-2xl font-bold">{formatStreakText(currentStreak)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-medium">Лучшая серия</h3>
          </div>
          <p className="text-2xl font-bold">{formatStreakText(bestStreak)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <h3 className="font-medium">Разных задач</h3>
          </div>
          <p className="text-2xl font-bold">{uniqueTasks}</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5 text-yellow-500" />
          <h3 className="font-medium">Достижения</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                achievement.isUnlocked
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50 opacity-50'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {achievement.icon}
                <span className="font-medium">{achievement.title}</span>
              </div>
              <p className="text-sm text-gray-600">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Недавние выполнения</h3>
        </div>
        <div className="space-y-2">
          {completions.slice(0, 5).map((completion, index) => (
            <div
              key={`${completion.id}-${index}`}
              className="flex justify-between items-center py-2 border-b last:border-0"
            >
              <span className="font-medium">{completion.title}</span>
              <span className="text-sm text-gray-500">
                {format(completion.timestamp, 'dd MMMM, HH:mm', { locale: ru })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
