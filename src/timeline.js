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

    this.dayIndex = {};

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
    this.load = function(from, to)
    {

        var interval = { from: from, to: to };
        var arr = tline.datasource(interval);
        var event, dayIndexKey, loop;

        function initLoop(event)
        {
            if (event.dtstart < from) {
                return new Date(from);
            }
            return new Date(event.dtstart);
        }

        for(var i=0; i<arr.length; i++) {

            event = arr[i];
            tline.loadedEvents.push(event);

            loop = initLoop(event);
            while (loop.getTime() < event.dtend.getTime()) {

                if (loop.getTime() > to) {
                    break;
                }

                dayIndexKey = tline.teleperiod.getDayBegin(loop);

                if (tline.dayIndex[dayIndexKey] != undefined) {
                    tline.addEventOnDay(tline.dayIndex[dayIndexKey], event);
                }

                loop.setDate(loop.getDate() + 1);
            }
        }
    }





    /**
     * Draw one day
     * @param {Date} d [[Description]]
     */
    this.drawDate = function(g, d)
    {
        var telep = tline.teleperiod;

        var day = g.append('rect')
                .attr('class', 'timelineday')
                .attr('y', telep.getDateHeight() + 10)
                .attr('width', telep.getDateWidth())
                .attr('height', telep.getTimelineHeight());



        tline.dayIndex[tline.teleperiod.getDayBegin(d)] = day;
    }




    /**
     * @param {array} d d3 html element
     * @param {object} event
     */
    this.addEventOnDay = function(d, event)
    {
        var title;
        var content = '';

        title = d.select('title');
        if (!title.node()) {
            title = d.append('title');
        } else {
            content = title.text();
        }

        if (-1 === content.indexOf(event.summary)) {

            if (content.length > 0) {
                content += ', '+event.summary;
            } else {
                content = event.summary;
            }

            title.text(content);
        }

        d.attr('style', 'fill:rgba(150, 10, 10, 0.88);');
    }
}

