import React, { useMemo, useState } from 'react';
import { 
  startOfYear, 
  endOfYear, 
  eachWeekOfInterval, 
  startOfWeek, 
  format, 
  isSameDay,
  parseISO,
  getDay,
  subDays
} from 'date-fns';

interface ContributionHeatmapProps {
  data: { date: string; count: number }[];
  title: string;
  color?: string;
}

export const ContributionHeatmap: React.FC<ContributionHeatmapProps> = ({ 
  data, 
  title, 
  color = '#10B981' // Default emerald green for better contrast
}) => {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Create a map of date strings to counts for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach(({ date, count }) => {
      const dateKey = format(parseISO(date), 'yyyy-MM-dd');
      map.set(dateKey, count);
    });
    return map;
  }, [data]);

  // Generate grid squares for the year (52 weeks x 7 days)
  // Organized by day of week (all Sundays, then all Mondays, etc.)
  const gridSquares = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Get all weeks in the year, starting from Sunday
    const weeks = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 0 });
    
    // Organize by day of week (0 = Sunday, 1 = Monday, etc.)
    const squaresByDay: Array<Array<{ date: Date; count: number; weekIndex: number; dayIndex: number }>> = [[], [], [], [], [], [], []];
    
    weeks.forEach((weekStart, weekIndex) => {
      // For each day of the week (Sunday = 0, Monday = 1, etc.)
      for (let day = 0; day < 7; day++) {
        const squareDate = new Date(weekStart);
        squareDate.setDate(weekStart.getDate() + day);
        
        const dateKey = format(squareDate, 'yyyy-MM-dd');
        const count = (squareDate >= yearStart && squareDate <= yearEnd) 
          ? (dataMap.get(dateKey) || 0)
          : 0;
        
        squaresByDay[day].push({
          date: squareDate,
          count,
          weekIndex,
          dayIndex: day
        });
      }
    });
    
    // Flatten: all Sundays, then all Mondays, etc.
    const squares: Array<{ date: Date; count: number; weekIndex: number; dayIndex: number }> = [];
    for (let day = 0; day < 7; day++) {
      squares.push(...squaresByDay[day]);
    }
    
    return squares;
  }, [dataMap]);

  // Calculate opacity based on count (4 levels)
  const getOpacity = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 0.2;
    if (count >= 2 && count <= 4) return 0.5;
    if (count >= 5) return 1;
    return 0;
  };

  // Get intensity level for styling
  const getIntensityClass = (count: number): string => {
    if (count === 0) return '';
    if (count === 1) return 'opacity-20';
    if (count >= 2 && count <= 4) return 'opacity-50';
    return 'opacity-100';
  };

  const handleSquareHover = (e: React.MouseEvent<HTMLDivElement>, date: Date, count: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      date: format(date, 'MMM d, yyyy'),
      count,
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
  };

  const handleSquareLeave = () => {
    setTooltip(null);
  };

  // Get max count for normalization (optional, for future enhancements)
  const maxCount = useMemo(() => {
    return Math.max(...data.map(d => d.count), 1);
  }, [data]);

  return (
    <div className="bg-surface border border-surface/50 rounded-xl p-3 sm:p-4 md:p-6">
      <h3 className="text-xs sm:text-sm md:text-base font-semibold text-text mb-2 sm:mb-3 md:mb-4">{title}</h3>
      
      <div className="flex items-start gap-1.5 sm:gap-2">
        {/* Day labels - aligned with grid rows */}
        <div className="flex flex-col text-[9px] sm:text-[10px] text-text/60 font-mono" style={{ 
          gap: '4px' // Match grid gap-1 (0.25rem = 4px)
        }}>
          <div className="h-[11px] flex items-center justify-end pr-1 sm:pr-2">S</div>
          <div className="h-[11px] flex items-center justify-end pr-1 sm:pr-2">M</div>
          <div className="h-[11px] flex items-center justify-end pr-1 sm:pr-2">T</div>
          <div className="h-[11px] flex items-center justify-end pr-1 sm:pr-2">W</div>
          <div className="h-[11px] flex items-center justify-end pr-1 sm:pr-2">T</div>
          <div className="h-[11px] flex items-center justify-end pr-1 sm:pr-2">F</div>
          <div className="h-[11px] flex items-center justify-end pr-1 sm:pr-2">S</div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-x-auto -mx-2 px-2">
          <div 
            className="grid"
            style={{ 
              gridTemplateColumns: `repeat(${Math.ceil(gridSquares.length / 7)}, 11px)`,
              gridTemplateRows: 'repeat(7, 11px)',
              width: 'max-content',
              gap: '4px' // Explicit gap to match labels
            }}
          >
            {gridSquares.map((square, index) => {
              const opacity = getOpacity(square.count);
              const isToday = isSameDay(square.date, new Date());
              
              return (
                <div
                  key={`${square.weekIndex}-${square.dayIndex}-${index}`}
                  className={`rounded-sm transition-all duration-200 cursor-pointer relative ${
                    square.count > 0 
                      ? 'hover:ring-2 hover:ring-primary/50 hover:scale-110' 
                      : ''
                  } ${isToday ? 'ring-2 ring-primary/30' : ''}`}
                  style={{
                    width: '11px',
                    height: '11px',
                    backgroundColor: square.count > 0 ? color : '#0F172A', // Use obsidian color for empty squares
                    opacity: square.count > 0 ? opacity : 1,
                    border: square.count === 0 ? '1px solid rgba(51, 65, 85, 0.4)' : 'none' // Subtle border for visibility
                  }}
                  onMouseEnter={(e) => handleSquareHover(e, square.date, square.count)}
                  onMouseLeave={handleSquareLeave}
                  title={`${format(square.date, 'MMM d, yyyy')}: ${square.count} completed`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3 sm:mt-4 text-xs text-text/60">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, opacity: 0.2 }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, opacity: 0.5 }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color, opacity: 1 }} />
        </div>
        <span>More</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-2 bg-surface border border-surface/50 rounded-lg text-sm text-text pointer-events-none shadow-lg"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium">{tooltip.date}</div>
          <div className="text-text/70">{tooltip.count} {tooltip.count === 1 ? 'completion' : 'completions'}</div>
        </div>
      )}
    </div>
  );
};

