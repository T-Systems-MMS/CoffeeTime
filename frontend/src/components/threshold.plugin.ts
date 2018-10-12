import { IChartistBase, IChartOptions, Line, Bar } from "chartist";
import { defaults } from "lodash";

export interface ThresholdPluginOptions {
    thresholds: number[],
    className?: string
}

export function thresholdPlugin(options: ThresholdPluginOptions) {
    options = defaults(options, {
        className: 'ct-threshold'
    });
    // sort thresholds
    options.thresholds.sort()
    // add base
    const internalThresholds = [0, ...options.thresholds];

    return function (chart: IChartistBase<IChartOptions>) {
        if (chart instanceof Line || chart instanceof Bar) {

            chart.on('draw', function (data) {
                for (let i = 0; i < internalThresholds.length; i++) {
                    if (data.type === 'point') {
                        // apply only class
                        if (data.value.y >= internalThresholds[i] && (!internalThresholds[i + 1] || data.value.y < internalThresholds[i + 1])) {
                            data.element.addClass(options.className + '-' + i);
                        }
                    } else if (data.type === 'line' || data.type === 'bar' || data.type === 'area') {
                        if (i === internalThresholds.length - 1) {
                            // reuse original element
                            data.element
                                .attr({ mask: 'url(#' + options.className + '-mask-' + i + ')' })
                                .addClass(options.className + '-' + i);
                        } else {
                            // add new elements for thresholds
                            data.element
                                .parent()
                                .elem(data.element._node.cloneNode(true), null, null, true)
                                .attr({ mask: 'url(#' + options.className + '-mask-' + i + ')' })
                                .addClass(options.className + '-' + i);
                        }
                    }
                }
            });

            chart.on('created', function (data) {
                const defs = data.svg.querySelector('defs') || data.svg.elem('defs');
                const width = data.svg.width();
                const height = data.svg.height();
                const rectHeight = data.chartRect.height() + data.chartRect.y2;

                for (let i = 0; i < internalThresholds.length; i++) {

                    const projectedThreshold = rectHeight - data.axisY.projectValue(internalThresholds[i]);
                    const nextThreshold = (i + 1) < internalThresholds.length ? internalThresholds[i + 1] : data.axisY.range.max;
                    const nextProjectedThreshold = rectHeight - data.axisY.projectValue(nextThreshold);

                    defs
                        .elem('mask', {
                            x: 0, y: 0,
                            width: width, height: height,
                            id: options.className + '-mask-' + i
                        })
                        .elem('rect', {
                            x: 0, y: nextProjectedThreshold,
                            width: width, height: projectedThreshold - nextProjectedThreshold,
                            fill: 'white'
                        });
                }
            });
        }
    }
}