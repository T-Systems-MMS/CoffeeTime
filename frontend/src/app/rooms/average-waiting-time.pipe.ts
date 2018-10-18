import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'averageWaitingTime'
})
export class AverageWaitingTimePipe implements PipeTransform {

    transform(value: number, args?: any): string {
        if (!value) {
            return 'n/a';
        }

        let seconds = value / 1000;
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds - minutes * 60);
        return `${minutes > 0 ? `${minutes} min` : ''} ${seconds} s`;
    }
}
