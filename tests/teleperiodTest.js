/*global describe: false, it: false, chai: false */


var expect = chai.expect;

var teleperiod = new Teleperiod({
    object: null,
    dateLocale: 'fr-FR',
    focusDate: new Date(2014, 11, 25),
    selectedEvents: [],
    workingtimes: function(interval) {},
    events: function(interval) {},
    onUpdated: function(selection) {}
});


describe('Teleperiod', function() {
    'use strict';

    describe('getWorkingTimesFromEvent()', function() {
        it('regular event', function() {
            var workingtimes = teleperiod.getWorkingTimesFromEvent({
                dtstart: new Date(2015, 0, 3, 9, 30, 0),
                dtend: new Date(2015, 0, 3, 17, 15, 0)
            });
            expect(workingtimes).to.have.lengthOf(1);
        });

        it('2 days event', function() {
            var workingtimes = teleperiod.getWorkingTimesFromEvent({
                dtstart: new Date(2015, 0, 3, 9, 30, 0),
                dtend: new Date(2015, 0, 4, 17, 15, 0)
            });
            expect(workingtimes).to.have.lengthOf(2);
        });

        it('2 days event with overlapping month', function() {
            var workingtimes = teleperiod.getWorkingTimesFromEvent({
                dtstart: new Date(2015, 0, 31, 9, 30, 0),
                dtend: new Date(2015, 1, 1, 17, 15, 0)
            });
            expect(workingtimes).to.have.lengthOf(2);
        });

        it('4 days event with overlapping month', function() {
            var workingtimes = teleperiod.getWorkingTimesFromEvent({
                dtstart: new Date(2020, 0, 31, 17, 0, 0),
                dtend: new Date(2020, 1, 3, 8, 0, 0)
            });
            expect(workingtimes).to.have.lengthOf(4);
            workingtimes.forEach(function(e) {
                expect(e.dtstart).to.be.below(e.dtend);
            });
        });

        it('4 days event with overlapping month, end before start minute', function() {
            var workingtimes = teleperiod.getWorkingTimesFromEvent({
                dtstart: new Date(2020, 0, 31, 16, 0, 0),
                dtend: new Date(2020, 1, 3, 6, 0, 0)
            });
            expect(workingtimes).to.have.lengthOf(3);
        });
    });
});
