function loadPreview()
{
    'use strict';

    var teleperiod = new Teleperiod({
        object: d3.select('#teleperiod_placeholder'),
        dateLocale: 'fr-FR',
        focusDate: new Date(2014, 11, 25),

        selectedEvents: ['111111111111111111111'],

        //dayFirstMinute: 0,
        //dayLastMinute: 23*60 + 59,

        workingtimes: function(interval) {

            return Q.fcall(function () {
                // return working times (selectable periods)

                var workingtimes = [];
                var loop = new Date(interval.from);
                while (loop.getTime() < interval.to.getTime()) {

                    if (loop.getDay() !== 0 && loop.getDay() !== 6) {
                        var before = {};
                        var mbreak = {};
                        var after = {};

                        mbreak.summary = 'lunch';
                        mbreak.dtstart = new Date(loop);
                        mbreak.dtstart.setHours(12, 0, 0);
                        mbreak.dtend = new Date(loop);
                        mbreak.dtend.setHours(13, 0, 0);


                        after.summary = 'night';
                        after.dtstart = new Date(loop);
                        after.dtstart.setHours(18, 0, 0);
                        after.dtend = new Date(loop);
                        after.dtend.setHours(8, 0, 0);
                        if (loop.getDay() === 5) {
                            after.dtend.setDate(after.dtend.getDate() + 3);
                        } else {
                            after.dtend.setDate(after.dtend.getDate() + 1);
                        }

                        workingtimes.push(mbreak);
                        workingtimes.push(after);
                    }

                    loop.setDate(loop.getDate() + 1);
                }

                return workingtimes;
            });
        },

        events: function(interval) {

            return Q.fcall(function () {
                // return other events displayed on the graph

                var events = [];

                var loop = new Date(interval.from);

                while (loop.getTime() < interval.to.getTime()) {
                    if (0 === loop.getMonth() && 1 === loop.getDate()) {

                        var newYearDay = {
                            summary: 'New year day'
                        };

                        newYearDay.dtstart = new Date(loop);
                        newYearDay.dtstart.setHours(0, 0, 0);

                        newYearDay.dtend = new Date(newYearDay.dtstart);
                        newYearDay.dtend.setDate(newYearDay.dtstart.getDate() + 1);

                        newYearDay.categories = ['nonworking'];

                        events.push(newYearDay);
                    }


                    loop.setDate(loop.getDate() + 1);
                }


                events.push({
                    uid: '0000ABC',
                    summary: 'Test 1',
                    dtstart: new Date(2015, 0, 3, 9, 30, 0),
                    dtend: new Date(2015, 0, 6, 17, 15, 0)
                });


                events.push({
                    uid: '111111111111111111111',
                    summary: 'Test 2',
                    dtstart: new Date(2015, 0, 14, 9, 30, 0),
                    dtend: new Date(2015, 0, 14, 17, 15, 0)
                });


                events.push({
                    uid: 'abc459231345',
                    summary: 'i am a very long summary',
                    dtstart: new Date(2015, 0, 19, 9, 30, 0),
                    dtend: new Date(2015, 0, 19, 11, 15, 0)
                });


                events.push({
                    uid: 'abc459231345+',
                    summary: 'duplicated',
                    dtstart: new Date(2015, 0, 19, 9, 30, 0),
                    dtend: new Date(2015, 0, 19, 11, 15, 0)
                });


                return events;
            });
        },

        onUpdated: function(selection) {

            var dtstart = selection.dtstart ? selection.dtstart.toLocaleString() : null;
            var dtend = selection.dtend ? selection.dtend.toLocaleString() : null;

            d3.select('#dtstart').attr('value', dtstart);
            d3.select('#dtend').attr('value', dtend);

            d3.select('.duration').text(selection.getDuration()+' ms');
            var details = d3.select('.details');
            details.selectAll("p").remove();

            var arr = selection.getValidPeriods();
            for(var i=0; i< arr.length; i++) {
                details.append('p').text('From '+arr[i].dtstart.toLocaleString()+ ' to '+arr[i].dtend.toLocaleString());
            }
        }
    });


    function addEvent(interval, events, event)
    {
        if (interval.from < event.dtend && interval.to > event.dtstart) {
            events.push(event);
        }
    }



    var vacations = new Timeline('Scolar vacations', function(interval) {

        return Q.fcall(function () {
            var events = [];
            var christmas = {
                summary: 'Christmas vacations',
                dtstart: new Date(2014, 11, 20, 8, 0, 0),
                dtend: new Date(2015, 0, 5, 19, 0, 0)
            };

            addEvent(interval, events, christmas);

            return events;
        });
    });

    teleperiod.addTimeLine(vacations);



    var availability = new Timeline('Department availability', function(interval) {

        return Q.fcall(function () {

            var events = [];
            var employee1 = {
                summary: 'Roberto Carlos is on vacation',
                dtstart: new Date(2015, 0, 2, 8, 0, 0),
                dtend: new Date(2015, 0, 7, 22, 0, 0)
            };

            var employee2 = {
                summary: 'Bob Martinez is on vacation',
                dtstart: new Date(2015, 0, 5, 8, 0, 0),
                dtend: new Date(2015, 0, 19, 22, 0, 0)
            };

            var employee3 = {
                summary: 'Billy Morisson is on vacation',
                dtstart: new Date(2015, 0, 29, 14, 0, 0),
                dtend: new Date(2015, 1, 15, 12, 0, 0)
            };

            var employee4 = {
                summary: 'John Doe is on vacation',
                dtstart: new Date(2015, 1, 12, 9, 0, 0),
                dtend: new Date(2015, 1, 12, 12, 0, 0)
            };

            var employee5 = {
                summary: 'Suzan Doe is on vacation',
                dtstart: new Date(2015, 1, 12, 9, 0, 0),
                dtend: new Date(2015, 1, 13, 19, 0, 0)
            };

            addEvent(interval, events, employee1);
            addEvent(interval, events, employee2);
            addEvent(interval, events, employee3);
            addEvent(interval, events, employee4);
            addEvent(interval, events, employee5);

            return events;
        });
    });


    availability.setColor(0, 'rgba(45, 209, 23, 0.76)');
    availability.setColor(1, 'rgba(233, 255, 35, 0.99)');
    availability.setColor(2, 'rgba(255, 187, 35, 0.99)');
    availability.setColor(3, 'rgba(222, 34, 0, 0.99)');

    teleperiod.addTimeLine(availability);





    teleperiod.draw();

    teleperiod.setSelection(new Date(2015, 1, 10, 0, 0, 0), new Date(2015, 1, 11, 0, 0, 0));


    document.getElementById('testMoveTo').addEventListener("click", function( event ) {

        function randomDate(start, end) {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        var randDate = randomDate(new Date(2000, 0, 1), new Date(2030, 0, 1));
        teleperiod.moveTo(randDate);
    });


    document.getElementById('testRefreshEvents').addEventListener("click", function( event ) {
        teleperiod.refreshEvents();
    });


    window.teleperiod = teleperiod;
}
