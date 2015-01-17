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
        console.log(pointer_date);

        if (null === selection.dtstart || selection.dtstart.getTime() > pointer_date.getTime()) {
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
     * Get an array of periods beetween dtstart and dtend of all working times periods in the interval
     * @return {Array}
     */
    this.getValidPeriods = function()
    {

    }
}
