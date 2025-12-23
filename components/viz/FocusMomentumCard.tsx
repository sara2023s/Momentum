import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

interface FocusMomentumCardProps {
  thisWeekCount: number;
  lastWeekCount: number;
  last7DaysMinutes: number[]; // Array of 7 numbers representing minutes for each of the last 7 days
}

export const FocusMomentumCard: React.FC<FocusMomentumCardProps> = ({
  thisWeekCount,
  lastWeekCount,
  last7DaysMinutes
}) => {
  const difference = thisWeekCount - lastWeekCount;
  const isPositive = difference >= 0;
  const maxMinutes = Math.max(...last7DaysMinutes, 1); // Avoid division by zero

  // Generate day labels for last 7 days
  const dayLabels = useMemo(() => {
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      labels.push(format(date, 'EEE'));
    }
    return labels;
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-midnight-surface border border-midnight-border rounded-xl p-4 sm:p-6"
    >
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
        {/* Left Side - Headline Stats */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="mb-2">
            <div className="text-3xl sm:text-4xl font-bold text-text-main mb-1">{thisWeekCount}</div>
            <div className="text-xs sm:text-sm text-text-muted">Sessions This Week</div>
          </div>
          
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm ${
            isPositive ? 'text-mint-primary' : 'text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp size={14} className="sm:w-4 sm:h-4 text-mint-primary" />
            ) : (
              <TrendingDown size={14} className="sm:w-4 sm:h-4 text-red-400" />
            )}
            <span>
              {Math.abs(difference)} {difference === 1 ? 'session' : 'sessions'} {isPositive ? 'more' : 'fewer'} than last week
            </span>
          </div>
        </div>

        {/* Right Side - Mini Bar Chart */}
        <div className="flex-1 w-full sm:w-auto">
          <div className="mb-2">
            <div className="text-xs text-text-muted uppercase tracking-wider mb-2 sm:mb-3">Last 7 Days</div>
          </div>
          
          <div className="flex items-end gap-1 sm:gap-1.5 h-16 sm:h-20">
            {last7DaysMinutes.map((minutes, index) => {
              const height = (minutes / maxMinutes) * 100;
              const dayLabel = dayLabels[index];
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  <div
                    className="w-full bg-mint-primary rounded-t-sm transition-all duration-300 hover:bg-teal-500 group-hover:ring-2 group-hover:ring-mint-primary/50"
                    style={{
                      height: `${Math.max(height, 4)}%`, // Minimum 4% for visibility
                      minHeight: minutes > 0 ? '4px' : '0'
                    }}
                    title={`${dayLabel}: ${minutes} min`}
                  />
                  <div className="text-[9px] sm:text-[10px] text-text-muted mt-1 font-mono">
                    {dayLabel.slice(0, 1)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Tooltip on hover */}
          <div className="mt-2 text-xs text-text-muted text-center">
            {last7DaysMinutes.reduce((sum, min) => sum + min, 0)} min total
          </div>
        </div>
      </div>
    </motion.div>
  );
};



