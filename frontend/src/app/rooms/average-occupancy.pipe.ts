import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'averageOccupancy'
})
export class AverageOccupancyPipe implements PipeTransform {

  transform(value: number, args?: any): string {
    if (!value) {
      return 'n/a';
    }

    const percent = value * 100;
    return percent + ' %';
  }

}
