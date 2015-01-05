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

    this.main = settings.object;
    this.settings = settings;

    var telep = this;

    this.workingtimesEvents = [];

    this.timelines = [];

    this.loadedIntervals = [];

    this.setSize = function() {
        telep.main
            .attr("width", this.settings.width || 500)
            .attr("height", teleperiod.timelines.length * 20);
    };


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
}
