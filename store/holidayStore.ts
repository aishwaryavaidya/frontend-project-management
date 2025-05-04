import { create } from 'zustand';
import { format, isWeekend } from 'date-fns';

interface Holiday {
  date: Date;
  name: string;
  isRecurring: boolean;
}

interface HolidayState {
  holidays: Holiday[];
  excludeWeekends: boolean;
  addHoliday: (date: Date, name: string, isRecurring?: boolean) => void;
  removeHoliday: (date: Date) => void;
  toggleExcludeWeekends: () => void;
  isHoliday: (date: Date) => boolean;
}

export const useHolidayStore = create<HolidayState>((set, get) => ({
  holidays: [],
  excludeWeekends: true,

  addHoliday: (date, name, isRecurring = false) => {
    set(state => ({
      holidays: [...state.holidays, { date, name, isRecurring }]
    }));
  },

  removeHoliday: (dateToRemove) => {
    set(state => ({
      holidays: state.holidays.filter(h => 
        format(h.date, 'yyyy-MM-dd') !== format(dateToRemove, 'yyyy-MM-dd')
      )
    }));
  },

  toggleExcludeWeekends: () => {
    set(state => ({
      excludeWeekends: !state.excludeWeekends
    }));
  },

  isHoliday: (date) => {
    const { holidays, excludeWeekends } = get();
    
    // Check if date is a weekend and settings say to exclude weekends
    if (excludeWeekends && isWeekend(date)) {
      return true;
    }
    
    // Check if date is in the holidays list
    const formattedDate = format(date, 'yyyy-MM-dd');
    return holidays.some(h => {
      if (h.isRecurring) {
        // For recurring holidays, check month and day only
        return (
          format(h.date, 'MM-dd') === format(date, 'MM-dd')
        );
      } else {
        // For non-recurring, check exact date
        return format(h.date, 'yyyy-MM-dd') === formattedDate;
      }
    });
  }
}));

// Helper function for other files to use without importing the store directly
export function isHoliday(date: Date): boolean {
  return useHolidayStore.getState().isHoliday(date);
} 