import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
  standalone: true
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return '0';
    
    let num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0';

    const absNum = Math.abs(num);
    const sign = num < 0 ? '-' : '';

    if (absNum >= 1000000) {
      return sign + (absNum / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (absNum >= 1000) {
      return sign + (absNum / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }
}
