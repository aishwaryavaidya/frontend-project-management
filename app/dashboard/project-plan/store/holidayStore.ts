import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AutoplantHoliday {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  day: string; // Day of week (3-letter abbreviation)
  name: string;
  optional: boolean;
}

interface HolidayState {
  // Default exclusions
  excludeSundays: boolean;
  excludeAllSaturdays: boolean;
  excludeEvenSaturdays: boolean;
  excludeAutoplantHolidays: boolean;
  excludeOptionalHolidays: boolean;
  
  // Holiday list
  autoplantHolidays: AutoplantHoliday[];
  
  // Actions
  toggleSundays: () => void;
  toggleAllSaturdays: () => void;
  toggleEvenSaturdays: () => void;
  toggleAutoplantHolidays: () => void;
  toggleOptionalHolidays: () => void;
  addHoliday: (holiday: AutoplantHoliday) => void;
  updateHoliday: (id: string, updates: Partial<AutoplantHoliday>) => void;
  deleteHoliday: (id: string) => void;
  
  // Helper functions
  isExcludedDate: (date: Date) => boolean;
  getBusinessDays: (startDate: Date, endDate: Date) => number;
}

export const useHolidayStore = create<HolidayState>()(
  persist(
    (set, get) => ({
      // Default settings
      excludeSundays: true,
      excludeAllSaturdays: false,
      excludeEvenSaturdays: false,
      excludeAutoplantHolidays: true,
      excludeOptionalHolidays: false,
      autoplantHolidays: [
        {
          id: '1',
          date: '2024-01-01',
          day: 'Mon',
          name: 'New Year\'s Day',
          optional: false,
        },
        {
          id: '2',
          date: '2024-01-26',
          day: 'Fri',
          name: 'Republic Day',
          optional: false,
        },
        {
          id: '3',
          date: '2024-08-15',
          day: 'Thu',
          name: 'Independence Day',
          optional: false,
        },
        {
          id: '4',
          date: '2024-10-02',
          day: 'Wed',
          name: 'Gandhi Jayanti',
          optional: false,
        },
        {
          id: '5',
          date: '2024-12-25',
          day: 'Wed',
          name: 'Christmas Day',
          optional: false,
        },
      ],
      
      // Actions for toggles
      toggleSundays: () => set(state => ({ excludeSundays: !state.excludeSundays })),
      toggleAllSaturdays: () => set(state => ({ 
        excludeAllSaturdays: !state.excludeAllSaturdays,
        // If we're enabling all Saturdays, disable even Saturdays
        excludeEvenSaturdays: !state.excludeAllSaturdays ? false : state.excludeEvenSaturdays
      })),
      toggleEvenSaturdays: () => set(state => ({ excludeEvenSaturdays: !state.excludeEvenSaturdays })),
      toggleAutoplantHolidays: () => set(state => ({ 
        excludeAutoplantHolidays: !state.excludeAutoplantHolidays,
        // If we're disabling holidays, also disable optional ones
        excludeOptionalHolidays: !state.excludeAutoplantHolidays ? false : state.excludeOptionalHolidays
      })),
      toggleOptionalHolidays: () => set(state => ({ excludeOptionalHolidays: !state.excludeOptionalHolidays })),
      
      // CRUD operations for holidays
      addHoliday: (holiday) => set(state => ({
        autoplantHolidays: [
          ...state.autoplantHolidays,
          { ...holiday, id: String(crypto.randomUUID()) }
        ]
      })),
      
      updateHoliday: (id, updates) => set(state => ({
        autoplantHolidays: state.autoplantHolidays.map(h => 
          h.id === id ? { ...h, ...updates } : h
        )
      })),
      
      deleteHoliday: (id) => set(state => ({
        autoplantHolidays: state.autoplantHolidays.filter(h => h.id !== id)
      })),
      
      // Helper function to check if a date is excluded
      isExcludedDate: (date: Date) => {
        const state = get();
        const day = date.getDay();
        const dateStr = date.toISOString().split('T')[0];
        
        // Check for Sunday
        if (state.excludeSundays && day === 0) {
          return true;
        }
        
        // Check for Saturday
        if (state.excludeAllSaturdays && day === 6) {
          return true;
        }
        
        // Check for even Saturday
        if (state.excludeEvenSaturdays && day === 6) {
          // Get the Saturday number in the month (1st, 2nd, 3rd, 4th, 5th)
          const weekNumber = Math.ceil(date.getDate() / 7);
          if (weekNumber % 2 === 0) {
            return true;
          }
        }
        
        // Check for company holidays
        if (state.excludeAutoplantHolidays) {
          const holiday = state.autoplantHolidays.find(h => h.date === dateStr);
          if (holiday) {
            // If it's optional, only exclude if we're excluding optional holidays
            if (holiday.optional) {
              return state.excludeOptionalHolidays;
            }
            // Otherwise exclude it
            return true;
          }
        }
        
        return false;
      },
      
      // Helper to calculate business days between two dates
      getBusinessDays: (startDate: Date, endDate: Date) => {
        const state = get();
        let count = 0;
        const curDate = new Date(startDate.getTime());
        
        while (curDate <= endDate) {
          if (!state.isExcludedDate(curDate)) {
            count++;
          }
          curDate.setDate(curDate.getDate() + 1);
        }
        
        return count;
      }
    }),
    {
      name: 'holiday-settings',
      // Only store these properties in localStorage
      partialize: (state) => ({
        excludeSundays: state.excludeSundays,
        excludeAllSaturdays: state.excludeAllSaturdays,
        excludeEvenSaturdays: state.excludeEvenSaturdays,
        excludeAutoplantHolidays: state.excludeAutoplantHolidays,
        excludeOptionalHolidays: state.excludeOptionalHolidays,
        autoplantHolidays: state.autoplantHolidays,
      }),
    }
  )
); 