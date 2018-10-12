import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges
} from '@angular/core';

import {
    Pie,
    Bar,
    Line,
    IChartistPieChart,
    IChartistBarChart,
    IChartistLineChart,
    IChartOptions,
    IChartistData,
    IResponsiveOptionTuple,
    IChartistBase
} from 'chartist';

interface Charts {
    Pie: IChartistPieChart;
    Bar: IChartistBarChart;
    Line: IChartistLineChart;
}
const charts: Charts = { 'Pie': Pie, 'Bar': Bar, 'Line': Line };

export interface ChartEvent {
    [eventName: string]: (data: any) => void;
}

@Component({
    selector: 'app-chart',
    template: '<ng-content></ng-content>'
})
export class ChartComponent implements OnInit, OnChanges, OnDestroy {
    @Input()
    public data: IChartistData;

    @Input()
    public type: string;

    @Input()
    public options: IChartOptions;

    @Input()
    public responsiveOptions: IResponsiveOptionTuple<IChartOptions>[];

    @Input()
    public events: ChartEvent;

    private chart: IChartistBase<IChartOptions>;

    private element: HTMLElement;

    constructor(element: ElementRef) {
        this.element = element.nativeElement;
    }

    public ngOnInit(): IChartistBase<IChartOptions> {
        if (!this.type || !this.data) {
            throw new Error('Expected at least type and data.');
        }

        const chart = this.renderChart();
        if (this.events !== undefined) {
            for (const event of Object.keys(this.events)) {
                chart.on(event, this.events[event]);
            }
        }
        return chart;
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (!this.chart || 'type' in changes) {
            this.renderChart();
        } else {
            if (changes.data) {
                this.data = changes.data.currentValue;
            }

            if (changes.options) {
                this.options = changes.options.currentValue;
            }

            this.chart.update(this.data, this.options);
        }
    }

    public ngOnDestroy(): void {
        if (this.chart) {
            this.chart.detach();
        }
    }

    public renderChart(): IChartistBase<IChartOptions> {
        if (!(this.type in charts)) {
            throw new Error(`${this.type} is not a valid chart type`);
        }

        this.chart = new charts[this.type](this.element, this.data, this.options, this.responsiveOptions);
        return this.chart;
    }
}
