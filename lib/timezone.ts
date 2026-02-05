/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Timezone utilities for Comoros (GMT+3)
 */

// Convert UTC date from database to Comoros time (GMT+3)
export function convertUTCToComorosTime(utcDate: Date | string): Date {
  const date = new Date(utcDate);
  // Comoros is GMT+3, so add 3 hours to UTC
  const comorosDate = new Date(date.getTime() + (3 * 60 * 60 * 1000));
  return comorosDate;
}

// Convert Comoros time to UTC for database storage
export function convertComorosTimeToUTC(comorosDate: Date): Date {
  // Subtract 3 hours from Comoros time to get UTC
  const utcDate = new Date(comorosDate.getTime() - (3 * 60 * 60 * 1000));
  return utcDate;
}

// Format date for display in Comoros timezone
export function formatComorosDate(date: Date | string, formatStr: string): string {
  const comorosDate = typeof date === 'string' 
    ? convertUTCToComorosTime(date)
    : convertUTCToComorosTime(date.toISOString());
  
  // Import date-fns format function
 
  const { format } = require('date-fns');
  const { fr } = require('date-fns/locale');
  
  return format(comorosDate, formatStr, { locale: fr });
}

// Get Comoros time from UTC string
export function getComorosTimeFromUTC(utcString: string): { hours: number, minutes: number } {
  const comorosDate = convertUTCToComorosTime(utcString);
  return {
    hours: comorosDate.getHours(),
    minutes: comorosDate.getMinutes()
  };
}

// Get current time in Comoros
export function getCurrentComorosTime(): Date {
  const now = new Date();
  return convertUTCToComorosTime(now.toISOString());
}