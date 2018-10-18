import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'averageWaitingTime'
})
export class AverageWaitingTimePipe implements PipeTransform {

  transform(value: number, args?: any): string {
    if (!value) {
      return 'n/a';
    }

    const minutes = Math.floor(value / 60000);
    const seconds = value - minutes * 60000;
    return `${minutes} min ${seconds} s`;
  }
}
