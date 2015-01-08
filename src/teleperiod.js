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



    this.initFloatDates = function() {
        var today = new Date();
        telep.floatFrom = new timespanBoundary(today);
        telep.floatTo = new timespanBoundary(today);


        telep.floatFrom.onUpdate(this.drawIntervalDates);
        telep.floatTo.onUpdate(this.drawIntervalDates);

        telep.floatTo.add(telep.getWidth() / telep.getDateWidth());



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

        telep.viewport.append('rect')
            .attr('class', 'buttonbg')
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeaderHeight())
            .on("click", telep.backward)
        ;

        telep.viewport.append('rect')
            .attr('class', 'buttonbg')
            .attr('x', telep.getWidth() - telep.getButtonWidth())
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeaderHeight())
            .on("click", telep.forward)
        ;

        telep.main
            .attr('class', 'main')
            .attr('x', 0)
            .attr("width", 4000)
            .attr('height', telep.getGraphHeight());


        telep.initFloatDates();
    }


    this.drawIntervalDates = function(from, to)
    {
        var loopDate = new Date(from);

        do {
            telep.drawDate(loopDate);
            loopDate.setDate(loopDate.getDate()+1);
        } while (loopDate < to);
    }


    /**
     * Draw one day
     * @param {Date} d [[Description]]
     */
    this.drawDate = function(d)
    {

        var s  = ((d.getTime() - telep.floatFrom.currentDate.getTime()) /1000);
        var days = s/ 86400;

        var g = telep.main.append('g')
                .attr('class', 'day')
                .attr('transform', 'translate('+(days * telep.getDateWidth())+','+telep.getHeaderHeight()+')');



            g
                .append('rect')
                .attr('width', telep.getDateWidth() - 1)
                .attr('height', 250);

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

        var interval = { from: from, to: to };
        telep.loadedIntervals.push(interval);

        var arr = telep.settings.workingtimes(interval);

        for(var i=0; i<arr.length; i++) {
            telep.workingtimesEvents.push(arr[i]);
        }

        for(var i=0; i<telep.timelines.length; i++) {
            telep.timelines[i].load(from, to);
        }
    }




    this.backward = function() {
        var x = parseInt(telep.main.attr('x'));
        telep.main.transition().attr('x', x+ 7* telep.getDateWidth());

        telep.floatFrom.add(7);
    }


    this.forward = function() {
        var x = parseInt(telep.main.attr('x'));
        telep.main.transition().attr('x',  x- 7* telep.getDateWidth());

        telep.floatTo.add(7);
    }
}
