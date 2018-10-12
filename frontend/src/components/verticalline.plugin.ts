import { Line, IChartOptions, IChartistBase, IChartistSvg, IChartistLineChart } from "chartist";
import { defaults } from 'lodash';

/**
 * Options for vertical line plugin.
 */
export interface VerticalLinePluginOptions {
    position: Date | number;
    className?: string;
    label?: string;
    lineOffset?: number;
    labelOffset?: number;
    labelPadding?: number;
}

interface ExtendedIChartistBase extends IChartistLineChart {
    svg: IChartistSvg;
}
/**
 * Plugin to show a vertical line in chartist chart
 */
export function verticalLinePlugin(options: VerticalLinePluginOptions): Function {
    options = defaults(options, {
        className: 'ct-vertical-line',
        lineOffset: 15,
        labelPadding: 5,
        labelOffset: 10
    }) as VerticalLinePluginOptions;

    return function (chart: IChartistBase<IChartOptions>) {
        if (!(chart instanceof Line)) {
            return;
        }

        // extract position and define vars
        let position: number = options.position instanceof Date ? options.position.getTime() : options.position;
        let xCoord: number;


        chart.on('created', function (data) {
            // define classes 
            const labelClassName = options.className + '-label';
            xCoord = data.axisX.projectValue(position) + data.chartRect.x1;

            // add line
            (chart as ExtendedIChartistBase).svg.elem('line', {
                x1: xCoord,
                x2: xCoord,
                y1: data.chartRect.y1 + options.lineOffset,
                y2: data.chartRect.y2 - options.lineOffset,
                style: 'stroke-width: 2px;'
            }, options.className);
            // add label
            const attr = { x: xCoord + options.labelPadding, y: options.labelOffset };
            (chart as ExtendedIChartistBase).svg.elem('text', attr, labelClassName).text(options.label);
        });
    }
}