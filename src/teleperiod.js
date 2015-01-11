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

    this.workingtimesEvents = [];

    this.timelines = [];

    this.loadedIntervals = [];


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
            .attr('class', 'button')
            .on("click", telep.backward)
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
            .attr('class', 'button')
            .attr('x', telep.getWidth() - telep.getButtonWidth())
            .on("click", telep.forward)
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
            telep.drawDate(loopDate);
            loopDate.setDate(loopDate.getDate()+1);
        };


        telep.load(from, to);
    }

    this.getDateX = function(d)
    {
        var s  = ((d.getTime() - telep.floatFrom.currentDate.getTime()) /1000);
        var days = Math.floor(s/ 86400);

        return days * telep.getDateWidth();
    }


    this.getDateY = function(d)
    {
        var minutes = (d.getHours() * 60) + d.getMinutes();
        var minFromStart = minutes - telep.getDayFirstMinute();
        var minTotal = telep.getDayLastMinute() - telep.getDayFirstMinute();
        return telep.getHeaderHeight() + Math.round(minFromStart * telep.getDateHeight() / minTotal);
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
            .text(d.toLocaleDateString('Fr-fr', {weekday: "long"}))
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
            .text(d.toLocaleDateString('Fr-fr', {month: "long", year: "numeric"}))
            ;
        }
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

        for(var i=0; i<arr.length; i++) {
            telep.workingtimesEvents.push(arr[i]);
            workingtimes.push(arr[i]);
        }

        for(var i=0; i<telep.timelines.length; i++) {
            telep.timelines[i].load(from, to);
        }

        telep.addWorkingtimes(workingtimes);
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

            telep.main.append('rect')
                .attr('class', 'workingtime')
                .attr('x', x)
                .attr('y', yStart)
                .attr('height', yEnd - yStart)
                .attr('width', telep.getDateWidth() -1)
            ;

        }
    }



    this.createSpaceOnLeft = function(nbDays) {

        telep.main.selectAll('.day').transition().attr('transform', function() {
            var m = this.getAttribute('transform').match(/\((\d+),(\d+)\)/);
            var newX = parseInt(m[1], 10)+ (nbDays * telep.getDateWidth()) ;

            return 'translate('+newX+','+m[2]+')';
        });
    }


    this.slideMain = function(nbDays) {

        telep.main.transition().attr('x', function() {
            return parseInt(this.getAttribute('x'), 10) + (nbDays * telep.getDateWidth());
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

            telep.createSpaceOnLeft(-1 * enlarge);
            telep.floatFrom.add(enlarge);

            return;
        }

        telep.slideMain(telep.getMoveDays());
    }

    /**
     * Click the right button
     */
    this.forward = function() {

        telep.viewportFrom += telep.getMoveDays();
        telep.viewportTo += telep.getMoveDays();

        telep.slideMain(-1 * telep.getMoveDays());

        if (telep.viewportTo > telep.floatTo.dayPosition) {

            var enlarge = telep.viewportTo - telep.floatTo.dayPosition;
            var width = Math.abs(parseInt(telep.main.attr('x'), 10)) + telep.getWidth();
            var enlargePx = Math.abs(enlarge * telep.getDateWidth());

            telep.main.attr("width", width + enlargePx);

            telep.floatTo.add(enlarge);
        }
    }
}
