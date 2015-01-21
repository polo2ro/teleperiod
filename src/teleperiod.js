'use strict';


/**
 * Main teleperiod class
 *
 * @param   {Object}   settings [[Description]]
 *
 */
function teleperiod(settings) {


    var telep = this;

    this.viewport = settings.object;

    this.settings = settings;

    this.main = null;

    this.wtTooltip = null;

    /**
     * Working times events indexed by day
     */
    this.workingtimesEvents = {};

    this.timelines = [];

    this.loadedIntervals = [];

    this.dayGroupByDate = {};

    this.queued = [];

    this.selection = new selection(this);


    this.getWidth = function() {
        return this.settings.width || 1000;
    }

    this.getDateWidth = function() {
        return this.settings.dateWidth || 30;
    }

    this.getDateHeight = function() {
        return 250;
    }

    this.getHeight = function() {
        return telep.getHeaderHeight() + telep.getGraphHeight() + (teleperiod.timelines.length * 20);
    }

    this.getHeaderHeight = function() {
        return 50;
    }


    this.getGraphHeight = function() {
        return 300;
    }


    this.getButtonWidth = function() {
        return this.settings.buttonWidth || 30;
    }

    this.getDayOff = function() {
        return this.settings.dayOff || [6,0];
    }

    this.getMoveDays = function() {
        return 7;
    }

    this.getDayFirstMinute = function() {
        return this.settings.dayFirstMinute || (7 * 60);
    }

    this.getDayLastMinute = function() {
        return this.settings.dayLastMinute || (20 * 60);
    }

    this.getSnapDistance = function() {
        return this.settings.snapDistance || 10;
    }

    this.getDateLocale = function() {
        return this.settings.dateLocale || 'Fr-fr';
    }


    this.initFloatDates = function() {
        var today = new Date();
        telep.floatFrom = new timespanBoundary(today);
        telep.floatTo = new timespanBoundary(today);




        telep.floatFrom.onUpdate(this.drawIntervalDates);
        telep.floatTo.onUpdate(this.drawIntervalDates);

        var viewPortDays = 1 + Math.round(telep.getWidth() / telep.getDateWidth());

        telep.viewportFrom = 0;
        telep.viewportTo = viewPortDays;

        telep.main.attr('width', viewPortDays * telep.getDateWidth());
        telep.floatTo.add(viewPortDays);
    }


    this.setSize = function() {
        telep.viewport
            .attr("width", telep.getWidth())
            .attr("height", telep.getHeight());
    };

    /**
     * Create main frame with the grid
     */
    this.createMain = function()
    {
        telep.main = telep.viewport.append('svg');
        telep.wtTooltip = telep.viewport.append('svg')
            .attr('width', telep.getDateWidth() + 100)
            .attr('height', 50)
            .style("opacity", 0)
        ;

        telep.wtTooltip.append('polygon')
            .attr("class", "wtTooltip")
            .attr('transform', 'translate('+telep.getDateWidth()+',0)')
            .attr('points', '15,0 100,0 100,50 15,50 15,25 0,2 15,8')
        ;

        telep.wtTooltip.append('line')
            .attr('x1', 0).attr('y1', 3)
            .attr('x2', telep.getDateWidth() -1).attr('y2', 3)
            .attr('stroke', "red")
            .attr('stroke-width', "2")
            .attr('pointer-events', 'none');
        ;

        var textX = telep.getDateWidth() + 23;

        telep.wtTooltip.append('text').attr('y', 20).attr('x', textX).attr('class', 'wtTooltipDate');
        telep.wtTooltip.append('text').attr('y', 40).attr('x', textX).attr('class', 'wtTooltipHour');

        telep.leftButton();
        telep.rightButton();



        telep.main
            .attr('class', 'main')
            .attr('x', 0)
            .attr("width", 0)
            .attr('height', telep.getGraphHeight());


        telep.initFloatDates();
    }



    this.leftButton = function()
    {
        var group = telep.viewport.append('svg')
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeaderHeight())
            .attr('class', 'button')
            .on('mousedown', function(){ d3.event.preventDefault(); }) // prevent text selection on double-click
            .on("click", function() { telep.queue(telep.backward); })
        ;

        group.append('rect')
            .attr('class', 'buttonbg')
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeaderHeight())

        ;

        group.append('polygon')
            .attr('class', 'buttonarrow')
            .attr('points', '25,5 25,45 5,25')
        ;
    }


    this.rightButton = function()
    {
        var group = telep.viewport.append('svg')
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeaderHeight())
            .attr('class', 'button')
            .attr('x', telep.getWidth() - telep.getButtonWidth())
            .on('mousedown', function(){ d3.event.preventDefault(); }) // prevent text selection on double-click
            .on("click", function() { telep.queue(telep.forward); })
        ;

        group.append('rect')
            .attr('class', 'buttonbg')
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeaderHeight())
        ;


        group.append('polygon')
            .attr('class', 'buttonarrow')
            .attr('points', '5,5 25,25 5,45')
        ;
    }


    this.drawIntervalDates = function(from, to)
    {
        var loopDate = new Date(from);

        while (loopDate < to) {
            var day_date = new Date(loopDate);
            var day_group = telep.drawDate(loopDate);
            loopDate.setDate(loopDate.getDate()+1);

            day_date.setHours(0,0,0);

            telep.dayGroupByDate[day_date] = day_group;
        };


        telep.load(from, to);
    }

    /**
     * Convert a date to a X postion
     * @param   {Date} d [[Description]]
     * @returns {Integer} [[Description]]
     */
    this.getDateX = function(d)
    {
        var ds = d.getTime() /1000;
        var fs = telep.floatFrom.currentDate.getTime() /1000;

        var dd = Math.ceil(ds /86400);
        var fd = Math.ceil(fs /86400);

        var days = dd - fd;

        return days * telep.getDateWidth();
    }


    /**
     * convert a date to a Y position inside the day group
     * @param   {Date} d [[Description]]
     * @returns {int} [[Description]]
     */
    this.getDateY = function(d)
    {
        var minutes = (d.getHours() * 60) + d.getMinutes();
        var minFromStart = minutes - telep.getDayFirstMinute();
        var minTotal = telep.getDayLastMinute() - telep.getDayFirstMinute();
        return Math.round(minFromStart * telep.getDateHeight() / minTotal);
    }


    /**
     * Get date from X
     *
     * @param   {Int} x [[Description]]
     * @returns {Date} [[Description]]
     */
    this.getDateFromX = function(x)
    {
        var daysFromOrigin = Math.ceil(x / telep.getDateWidth());
        var date = new Date(telep.floatFrom.currentDate);
        date.setDate(date.getDate() + daysFromOrigin);
        date.setHours(0,0,0);

        return date;
    }


    /**
     * convert y position to a number of minutes inside the day group
     * @param   {int} y [[Description]]
     * @returns {int} [[Description]]
     */
    this.getMinutesFromY = function(y)
    {
        var minTotal = telep.getDayLastMinute() - telep.getDayFirstMinute();
        var yPerMin = (telep.getDateHeight() / minTotal);

        var minutes = telep.getDayFirstMinute() + Math.round(y / yPerMin);
        return minutes;
    }



    /**
     * Draw one day
     * @param {Date} d [[Description]]
     */
    this.drawDate = function(d)
    {

        var x = telep.getDateX(d);

        var g = telep.main.append('g')
                .attr('class', 'day')
                .attr('transform', 'translate('+x+','+telep.getHeaderHeight()+')');



            g
                .append('rect')
                .attr('width', telep.getDateWidth() - 1)
                .attr('height', telep.getDateHeight());

        if (-1 !== telep.getDayOff().indexOf(d.getDay())) {
            g.attr('class', 'day dayoff');
        }

        g
        .append('text')
            .attr('class', 'weekday')
            .attr('x', 5)
            .attr('y', -10)
            .attr('transform', "rotate(90)")
            .text(d.toLocaleDateString(telep.getDateLocale(), {weekday: "long"}))
            ;

        g
        .append('text')
            .attr('class', 'date')
            .attr('x', telep.getDateWidth() /2)
            .attr('y', -10)
            .text(d.getDate())
            ;

        if (1 === d.getDate()) {
            g.append('text')
            .attr('class', 'month')
            .attr('x', 5)
            .attr('y', -35)
            .text(d.toLocaleDateString(telep.getDateLocale(), {month: "long", year: "numeric"}))
            ;
        }


        return g;
    }


    this.addTimeLine = function(name, datasource) {
        telep.timelines.push(new timeline(name, datasource));
    };

    /**
     * Load working times and timelines
     * @param {Date} from [[Description]]
     * @param {Date} to   [[Description]]
     */
    this.load = function(from, to) {

        var interval = {
            from: from,
            to: to
        };

        var workingtimes = [];

        telep.loadedIntervals.push(interval);

        var arr = telep.settings.workingtimes(interval);
        var indexDate;

        for(var i=0; i<arr.length; i++) {

            indexDate = new Date(arr[i].dtstart);
            indexDate.setHours(0, 0, 0);

            if (telep.workingtimesEvents[indexDate] == undefined) {
                telep.workingtimesEvents[indexDate] = [];
            }

            telep.workingtimesEvents[indexDate].push(arr[i]);
            workingtimes.push(arr[i]);
        }

        for(var i=0; i<telep.timelines.length; i++) {
            telep.timelines[i].load(from, to);
        }

        telep.addWorkingtimes(workingtimes);
    }


    /**
     * get day group element from date
     * @param {Date} d
     *
     * @return {array}
     */
    this.getDayGroupByDate = function(d)
    {
        var day = new Date(d);
        day.setHours(0,0,0);

        if (telep.dayGroupByDate[day] == undefined) {
            return null;
        }

        return telep.dayGroupByDate[day];
    }



    /**
     * Add workingtimes periods on exiting days
     * @param {Array} workingtimes [[Description]]
     */
    this.addWorkingtimes = function(workingtimes)
    {
        for (var i=0; i < workingtimes.length; i++) {
            var event = workingtimes[i];
            var x = telep.getDateX(event.dtstart);
            var yStart = telep.getDateY(event.dtstart);
            var yEnd = telep.getDateY(event.dtend);

            var dayGroup = telep.getDayGroupByDate(event.dtstart);

            dayGroup.append('rect')
                .attr('class', 'workingtime')
              //  .attr('x', x)
                .attr('y', yStart)
                .attr('height', yEnd - yStart)
                .attr('width', telep.getDateWidth() -1)
                .on('mouseover', function() {
                    telep.wtTooltip
                        .transition()
                        .duration(200)
                        .style("opacity", 1);
                })
                .on('mouseout', function() {
                    telep.wtTooltip
                        .transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on('mousemove', telep.updateWtTooltip)
                .on('click', function() {
                    telep.selection.setDate(telep.getPointerDate(this));
                    if (telep.selection.isValid()) {
                        telep.selection.highlightPeriods();
                    }
                })
            ;

        }
    }


    /**
     * Get rounded date every 10 minutes
     * @param {HTMLElement} workingTimesItem
     *
     * @return {Date}
     */
    this.getPointerDate = function(workingTimesItem)
    {
        var mouse = d3.mouse(workingTimesItem);
        var x = mouse[0];
        var y = mouse[1];

        var g = d3.select(workingTimesItem.parentNode);
        var x = parseInt(g.attr('transform').match(/translate\((\d+),\d+\)/)[1], 10);

        var pointerDate = telep.getDateFromX(x);



         // Snap Y to top or bottom if necessary

        var d3Item = d3.select(workingTimesItem);
        var topY = parseInt(d3Item.attr('y'), 10);
        var bottomY = topY + parseInt(d3Item.attr('height'), 10);
        var snap = telep.getSnapDistance();

        if (y - topY < snap) {
            y = topY;
        }

        if (bottomY - y < snap) {
            y = bottomY;
        }

        var min = telep.getMinutesFromY(y);

        var h = Math.floor(min / 60);
        var i = min % 60;

        // round every 10 min
        i = Math.round(i / 10) * 10;

        pointerDate.setHours(h,i,0);







        return pointerDate;
    }





    this.updateWtTooltip = function()
    {
        var pointerDate = telep.getPointerDate(this);

        var mouse = d3.mouse(this);
        var x = mouse[0];
        var y = mouse[1];

        var g = d3.select(this.parentNode);

        x = parseInt(g.attr('transform').match(/translate\((\d+),\d+\)/)[1], 10);
        x += parseInt(telep.main.attr('x'), 10);


        // set the y position according to the rounded date
        y = telep.getDateY(pointerDate);

        telep.wtTooltip.attr('x', x);
        telep.wtTooltip.attr('y', telep.getHeaderHeight() + y - 4);

        telep.wtTooltip.select('text.wtTooltipDate').text(
            pointerDate.toLocaleDateString(telep.getDateLocale())
        );

        telep.wtTooltip.select('text.wtTooltipHour').text(
            pointerDate.toLocaleTimeString(telep.getDateLocale(), {hour: "2-digit", minute: "2-digit" })
        );

    }




    /**
     * Slide main frame into viewport
     * @param   {Int} nbDays number of days to slide
     *
     */
    this.slideMain = function(nbDays) {

        return telep.main.transition().attr('x', function() {
            return parseInt(this.getAttribute('x'), 10) + (nbDays * telep.getDateWidth());
        });
    }


    /**
     * Process functions in queue
     * @param {function} fn function must return a d3 transition
     */
    this.queue = function(fn) {
        telep.queued.push(fn);

        if (1 < telep.queued.length) {
            // console.log('Skip process in queue');
            return;
        }

        telep.processQueued();
    }

    this.processQueued = function() {

        var oldest = telep.queued[0];
        var transition = oldest();

        var transitions = 0;

        transition.each( "start", function() {
            transitions++;
        }).each( "end", function() {
            if( --transitions === 0 ) {
                telep.queued.shift();

                if (0 >= telep.queued.length) {
                    return false;
                }

                telep.processQueued();
            }
        });
    }


    /**
     * @param {int} nbDays
     */
    this.createSpaceOnLeft = function(nbDays) {

        var currentwidth = parseInt(telep.main.attr('width'), 10);
        telep.main.attr('width', currentwidth + (nbDays * telep.getDateWidth()));

        telep.main.attr('x', function() {
            return parseInt(this.getAttribute('x'), 10) - (nbDays * telep.getDateWidth());
        });

        return telep.main.selectAll('.day').attr('transform', function() {

            var m = this.getAttribute('transform').match(/\((\d+),(\d+)\)/);

            if (!m) {
                return null;
            }

            var newX = parseInt(m[1], 10)+ (nbDays * telep.getDateWidth());

            return 'translate('+newX+','+m[2]+')';
        });
    }



    /**
     * Click the left button
     */
    this.backward = function() {

        telep.viewportFrom -= telep.getMoveDays();
        telep.viewportTo -= telep.getMoveDays();

        // move the days in main frame 7 days to the right (create space for 7 days)

        if (telep.viewportFrom < telep.floatFrom.dayPosition) {
            var enlarge = telep.viewportFrom - telep.floatFrom.dayPosition;
            var transition = telep.createSpaceOnLeft(-1 * enlarge);
            telep.floatFrom.add(enlarge);
        }

        return telep.slideMain(telep.getMoveDays());
    }

    /**
     * Click the right button
     */
    this.forward = function() {

        telep.viewportFrom += telep.getMoveDays();
        telep.viewportTo += telep.getMoveDays();

        if (telep.viewportTo > telep.floatTo.dayPosition) {

            var enlarge = telep.viewportTo - telep.floatTo.dayPosition;
            var width = Math.abs(parseInt(telep.main.attr('x'), 10)) + telep.getWidth();
            var enlargePx = Math.abs(enlarge * telep.getDateWidth());

            telep.main.attr("width", width + enlargePx);

            telep.floatTo.add(enlarge);
        }

        return telep.slideMain(-1 * telep.getMoveDays());
    }
}
