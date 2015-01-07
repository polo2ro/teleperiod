'use strict';

/**
 * Timeline reference object
 * @param {string}      name       Label for the timeline
 * @param {function} datasource object called when data is needed on the timeline
 */
function timeline(name, datasource) {

    this.name = name;
    this.datasource = datasource;

    this.loadedEvents = [];



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
}



function teleperiod(settings) {

    this.viewport = settings.object;
    this.settings = settings;

    this.main = null;



    var telep = this;

    this.workingtimesEvents = [];

    this.timelines = [];

    this.loadedIntervals = [];


    this.getWidth = function() {
        return this.settings.width || 800;
    }

    this.getHeight = function() {
        return telep.getGraphHeight() + teleperiod.timelines.length * 20;
    }


    this.getGraphHeight = function() {
        return 300;
    }


    this.getButtonWidth = function() {
        return this.settings.buttonWidth || 30;
    }



    this.initFloatDates = function() {
        var today = new Date();
        this.floatFrom = new Date(today);
        this.floatTo = new Date(today);

        this.floatFrom.setDate(today.getDate()-7);
        this.floatTo.setDate(today.getDate()+30);
    }


    this.setSize = function() {
        telep.viewport
            .attr("width", telep.getWidth())
            .attr("height", telep.getHeight());
    };

    /**
     * Create main frame with the grid
     */
    this.createMain = function() {

        telep.initFloatDates();

        telep.main = telep.viewport.append('svg');

        telep.viewport.append('rect')
            .attr('class', 'buttonbg')
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeight())
            .on("click", telep.backward)
        ;

        telep.viewport.append('rect')
            .attr('class', 'buttonbg')
            .attr('x', telep.getWidth() - telep.getButtonWidth())
            .attr('width', telep.getButtonWidth())
            .attr('height', telep.getHeight())
            .on("click", telep.forward)
        ;

        telep.main
            .attr('class', 'main')
            .attr('x', telep.getButtonWidth())
            .attr("width", telep.getWidth() -2*telep.getButtonWidth())
            .attr('height', telep.getGraphHeight());



        var loopDate = new Date(telep.floatFrom);

        do {
            telep.drawDate(loopDate);
            loopDate.setDate(loopDate.getDate()+1);
        } while (loopDate < telep.floatTo);
    }



    this.drawDate = function(d) {

        var s  = ((d.getTime() - telep.floatFrom.getTime()) /1000);
        var days = s/ 86400;

        var g = telep.main.append('g')
                .attr('class', 'day')
                .attr('transform', 'translate('+(days * 40)+',50)');



            g
                .append('rect')
                .attr('width', 39)
                .attr('height', 250);

        if (0 == d.getDay()) {
            g.attr('class', 'day dayoff');
        }

        g
        .append('text')
            .attr('x', 5)
            .attr('y', -5)
            .attr('transform', "rotate(90)")
            .text(d.toDateString())
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
        console.log(x);
        telep.main.attr('x', x+ 50);
    }


    this.forward = function() {
        var x = parseInt(telep.main.attr('x'));
        console.log(x);
        telep.main.attr('x',  x- 50);
    }
}
