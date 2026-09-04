import * as XLSX from 'xlsx';
import { ExpenseCategory } from '../types';

/**
 * Format numbers in standard Indian Rupee format (₹ 1,25,000)
 */
export function formatINR(amount: number | undefined | null, showSymbol = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? '₹0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format using Indian locale
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(absAmount);

  const prefix = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${prefix}${symbol}${formatted}`;
}

/**
 * Converts a number to Indian Rupee Words (e.g., "Ten Thousand Five Hundred Rupees Only")
 */
export function numberToWordsINR(amount: number): string {
  if (amount === 0) return 'Zero Rupees Only';
  if (isNaN(amount)) return '';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(num: number): string {
    if (num < 10) return singleDigits[num];
    if (num >= 10 && num < 20) return twoDigits[num - 10];
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + (unit !== 0 ? ' ' + singleDigits[unit] : '');
  }

  function convertThreeDigits(num: number): string {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    let res = '';
    if (hundred > 0) {
      res += singleDigits[hundred] + ' Hundred';
    }
    if (remainder > 0) {
      if (res !== '') res += ' and ';
      res += convertTwoDigits(remainder);
    }
    return res;
  }

  let num = Math.floor(Math.abs(amount));
  let result = '';

  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  const remaining = num;

  if (crores > 0) {
    result += convertTwoDigits(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    result += convertTwoDigits(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    result += convertTwoDigits(thousands) + ' Thousand ';
  }
  if (remaining > 0) {
    result += convertThreeDigits(remaining);
  }

  return (result.trim() + ' Rupees Only');
}

/**
 * Returns the real-time current date in YYYY-MM-DD format (local system/server date).
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format ISO or YYYY-MM-DD date to readable string like "1 Sept 2026" safely without UTC shifts
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const trimmed = String(dateString).trim();
  const datePart = trimmed.includes('T') ? trimmed.split('T')[0] : trimmed;
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const localDate = new Date(year, month, day);
    if (!isNaN(localDate.getTime())) {
      return new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(localDate);
    }
  }
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return trimmed;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format ISO date with time like "28 Aug 2026, 7:30 PM"
 */
export function formatDateTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Export data array to CSV file and trigger browser download
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map(row => {
        return keys
          .map(k => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString('en-IN') : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data array to Excel (.xlsx) file and trigger browser download
 */
export function exportToExcel(filename: string, sheetName: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) return;
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Color badge generator for categories
 */
export function getCategoryBadgeColor(category: ExpenseCategory | string): { bg: string; text: string; border: string } {
  switch (category) {
    case 'Decoration':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'Idol':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Lighting':
      return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' };
    case 'Sound System':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Stage':
      return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'Flowers':
      return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'Prasad/Food':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Pooja Materials':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    case 'Advertising':
    case 'Printing':
      return { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' };
    case 'Security':
    case 'Cleaning':
      return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' };
    case 'Cultural Events':
      return { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' };
    default:
      return { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' };
  }
}
