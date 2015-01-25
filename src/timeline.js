'use strict';

/**
 * Timeline reference object
 * Used to display informations under the teleperiod graph
 *
 * @param {string}   name       Label for the timeline
 * @param {function} datasource object called when data is needed on the timeline
 */
function timeline(name, datasource) {

    this.name = name;
    this.datasource = datasource;

    this.loadedEvents = [];

    /**
     * once attached to teleperiod
     * @var {teleperiod}
     */
    this.teleperiod = null;

    var tline = this;

    /**
     * load timeline between two dates
     * @param {Date} from [[Description]]
     * @param {Date} to   [[Description]]
     */
    this.load = function(from, to) {

        var interval = { from: from, to: to };
        var arr = tline.datasource(interval);

        for(var i=0; i<arr.length; i++) {
            tline.loadedEvents.push(arr[i]);
        }
    }


    /**
     * Draw one day
     * @param {Date} d [[Description]]
     */
    this.drawDate = function(d)
    {
        var telep = tline.teleperiod;

        var day = telep.main.append('rec')
                .attr('class', 'timelineday')
                .attr('x', telep.getDateX(d))
                .attr('y', telep.getHeaderHeight() + telep.getGraphHeight())
                .attr('width', telep.getDateWidth())
                .attr('height', telep.getTimelineHeight());

    }
}

