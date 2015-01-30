teleperiod
==========

period picker on a time line with working hours


![Preview](/examples/preview.png?raw=true)


Technical overview
------------------

The calendar is created in [SVG](http://fr.wikipedia.org/wiki/Scalable_Vector_Graphics) using [d3 js](http://d3js.org/) toolkit. This can be added in any web page and allow to retreive the periods of the selection in a javascript object.
It lazy load events and working hours while browsing on dates.

Installation as a [bower](http://bower.io/) componenent:

    bower install teleperiod


Features
--------

* Select one period on a calendar view
* Display mutiple timelines for references (ex: other pepoles availability, scolar vacations periods ...)
* Get the duration of the selection period according to working schedule and special events


Usage exemples
--------------

Room reservations, vacation periods request, resources management ...
