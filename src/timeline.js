/**
 * Timeline reference object
 * Used to display informations under the teleperiod graph
 *
 * @param {string}   name       Label for the timeline
 * @param {function} datasource object called when data is needed on the timeline
 */
function Timeline(name, datasource) {
    'use strict';
    this.name = name;
    this.datasource = datasource;

    this.loadedEvents = [];

    this.dayIndex = {};

    /**
     * once attached to teleperiod
     * @var {teleperiod}
     */
    this.teleperiod = null;

    /**
     * colors by number of events
     * @var object
     */
    this.color = {};

    var tline = this;



    /**
     * load timeline between two dates
     * @param {Date} from [[Description]]
     * @param {Date} to   [[Description]]
     */
    this.load = function(from, to)
    {

        var interval = { from: from, to: to };

        var event, dayIndexKey, loop;

        function initLoop(event)
        {
            var loop;
            if (event.dtstart < from) {
                loop = new Date(from);
            }
            loop = new Date(event.dtstart);
            loop.setHours(0, 0, 0);

            return loop;
        }

        var arr = tline.datasource(interval).then(function(arr) {
            for(var i=0; i<arr.length; i++) {

                event = arr[i];
                tline.loadedEvents.push(event);

                loop = initLoop(event);
                while (loop.getTime() < event.dtend.getTime() && loop.getTime() < to) {

                    dayIndexKey = tline.teleperiod.getDayBegin(loop);

                    if (tline.dayIndex[dayIndexKey] !== undefined) {
                        tline.addEventOnDay(tline.dayIndex[dayIndexKey], event);
                    }

                    loop.setDate(loop.getDate() + 1);
                }
            }
        });



    };





    /**
     * Draw one day
     * @param {array} g day group svg d3 element
     * @param {Date} d [[Description]]
     * @param {Integer} timelineIndex   timeline position, zero on top
     */
    this.drawDate = function(g, d, timelineIndex)
    {
        var telep = tline.teleperiod;

        var ytop = telep.getDateHeight() + telep.getTimelineMarginTop();
        var timeLineY = (timelineIndex * (telep.getTimelineHeight() + telep.getTimelineMarginTop()));

        var day = g.append('rect')
                .attr('class', 'timelineday')
                .attr('y', ytop + timeLineY)
                .attr('width', telep.getDateWidth())
                .attr('height', telep.getTimelineHeight())
                .attr('style', 'fill:'+tline.getBackgroundColor()+';');



        tline.dayIndex[tline.teleperiod.getDayBegin(d)] = day;
    };




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



        if (!d.node().__events) {
            d.node().__events = [];
        }
        var events = d.node().__events;
        events.push(event);

        if (content.length > 0) {
            content += ', '+event.summary;
        } else {
            content = event.summary;
        }

        title.text(content);


        d.attr('style', 'fill:'+tline.getColor(events.length)+';');
    };


    /**
     * set color for a number of events
     * @param {Integer} nbEvents        0 for background color
     * @param {string} fill color code
     */
    this.setColor = function(nbEvents, color)
    {
        tline.color[nbEvents] = color;
    };


    /**
     * @return string
     */
    this.getBackgroundColor = function()
    {
        if (tline.color[0]) {
            return tline.color[0];
        }

        return 'rgba(32, 47, 72, 0.78)';
    };

    /**
     * Get the color associated to number of events
     * or fallback to the nearest color
     * or fallback to a default color
     *
     * @return string nbEvents
     */
    this.getColor = function(nbEvents)
    {
        if (tline.color[nbEvents]) {
            return tline.color[nbEvents];
        }

        var prop = [];

        for (var nb in tline.color) {
            if (tline.color.hasOwnProperty(nb)) {
                if (nb > nbEvents) {
                    continue;
                }

                prop.push(nb);
            }
        }

        if (0 === prop.length) {
            return 'rgba(10, 180, 10, 1)';
        }

        prop.sort();
        return prop.pop();
    };
}

