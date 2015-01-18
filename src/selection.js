'use strict';

/**
 * Selection
 *
 *
 * @param {teleperiod}   teleperiod
 */
function selection(teleperiod) {

    this.teleperiod = teleperiod;

    /**
     * @var {Date}
     */
    this.dtstart = null;

    /**
     * @var {Date}
     */
    this.dtend = null;

    var selection = this;



    /**
     * @return {boolean}
     */
    this.isValid = function()
    {
        if (null === selection.dtend || null === selection.dtstart) {
            return false;
        }

        return (selection.dtstart.getTime() < selection.dtend.getTime())
    }


    /**
     * set new date
     * if the pointer_date is the first date, define the dtstart,
     * if dtstart allready set and pointer_date is after, define the dtend
     * if pointer_date is before dtstart, overwrite dtstart
     *
     * return true if a period is set
     *
     * @param {Date} pointer_date
     *
     * @return {boolean}
     */
    this.setDate = function(pointer_date)
    {
        if (null === selection.dtstart || selection.dtstart.getTime() > pointer_date.getTime() || selection.isValid()) {
            selection.dtstart = pointer_date;
            selection.dtend = null;
            return false;
        }


        if (selection.dtstart.getTime() < pointer_date.getTime()) {
            selection.dtend = pointer_date;
            return true;
        }


        return false;
    }

    /**
     * Get the list of <g> elements for the period
     * @return array
     */
    this.getDayGroups = function()
    {
        var loop = new Date(selection.dtstart);
        var daygroup;
        var g = [];

        while(loop < selection.dtend) {

            daygroup = selection.teleperiod.getDayGroupByDate(loop);
            g.push(daygroup);

            loop.setDate(loop.getDate() +1);
        }

        return g;
    }


    /**
     * create a cropped period or return the same period if the given parameter is included in selection
     * @param {object} p
     * @return {object}
     */
    this.cropPeriod = function(p)
    {
        if (p.dtstart >= selection.dtstart && p.dtend <= selection.dtend) {
           return p;
        }

        if (p.dtstart >= selection.dtend || p.dtend<= selection.dtstart) {
            return null;
        }

        var cropped = {};

        cropped.dtstart = p.dtstart >= selection.dtstart ? p.dtstart : selection.dtstart;
        cropped.dtend = p.dtend <= selection.dtend ? p.dtend : selection.dtend;

        return cropped;
    }


    /**
     * Get an array of periods beetween dtstart and dtend of all working times periods in the interval
     * @return {Array}
     */
    this.getValidPeriods = function()
    {
        var loop = new Date(selection.dtstart);
        loop.setHours(0, 0, 0);
        var indexDate, workingtime, cropped;
        var workingtimes = [];

        while(loop < selection.dtend) {

            if (selection.teleperiod.workingtimesEvents[loop] != undefined) {
                var workingTimesOnDay = selection.teleperiod.workingtimesEvents[loop];

                for(var i=0; i<workingTimesOnDay.length; i++) {

                    if (cropped = selection.cropPeriod(workingTimesOnDay[i])) {
                        workingtimes.push(cropped);
                    }
                }
            }

            loop.setDate(loop.getDate() +1);
        }

        return workingtimes;
    }

    /**
     * Display the selection on one day
     */
    this.highlightPeriods = function()
    {

        var periods = selection.getValidPeriods();

        for(var i=0; i<periods.length; i++) {
            var g = selection.teleperiod.getDayGroupByDate(periods[i].dtstart);
            selection.addOverlay(g, periods[i]);
        }

    }

    /**
     *
     */
    this.addOverlay = function(dayGroup, event)
    {
        console.log(event.dtstart.toLocaleTimeString());
        console.log(event.dtend.toLocaleTimeString());

        var yStart = selection.teleperiod.getDateY(event.dtstart);
        var yEnd = selection.teleperiod.getDateY(event.dtend);

        dayGroup.append('rect')
            .attr('class', 'selection')
            .attr('y', yStart)
            .attr('height', yEnd - yStart)
            .attr('width', selection.teleperiod.getDateWidth() -1)

            .on('click', function() {
                //TODO: remove selection
            })
        ;
    }
}
