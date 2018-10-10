import { Line, IChartOptions, IChartistBase, IChartistSvg, IChartistLineChart } from "chartist";

export interface VerticalLinePluginOptions {
    position: Date | number | string;
    className: string;
    label: string;
}

interface ExtendedIChartistBase extends IChartistLineChart {
    svg: IChartistSvg;
}

export function verticalLinePlugin(options: VerticalLinePluginOptions): Function {
    return function (chart: IChartistBase<IChartOptions>) {
        if (!(chart instanceof Line)) {
            return;
        }

        let index: number;
        let xCoord: number;

        chart.on('data', function () {
            index = (chart.data.labels as Array<any>).indexOf(options.position);
        });

        chart.on('draw', function (data) {
            if (index !== -1 && data.type === 'point' && data.index === index) {
                xCoord = data.x;
            }
        });

        chart.on('created', function (data) {

            if (index === -1) {
                return;
            }

            const labelClassName = options.className + '-label';

            const helperElem = document.createElement('div');
            helperElem.innerHTML = `<span class="${labelClassName}" style="position: absolute; display: none;">${options.label}</span>`;
            const label = (helperElem.firstChild as HTMLElement);
            label.style.left = (xCoord - (label.offsetWidth / 2)) + 'px';

            (chart as ExtendedIChartistBase).svg.elem('line', {
                x1: xCoord,
                x2: xCoord,
                y1: data.chartRect.y1,
                y2: data.chartRect.y2 + label.offsetHeight
            }, options.className);
            
            label.style.display = 'inline';
        });
    }
}