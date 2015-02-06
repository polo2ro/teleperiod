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


Usage
-----

Add to page teleperiod.min.js and teleperiod.min.css

create a svg placeholder in page:
```html
    <div class="row">
        <svg id="teleperiod_placeholder"></svg>
    </div>
```

Initialize teleperiod object with options:
```javascript
    var teleperiod = new Teleperiod({
        object: d3.select('#teleperiod_placeholder'),
        workingtimes: function(interval) {
        
        },
        events: function(interval) {
        
        },
        onUpdated: function(selection) {
        
        }
    });
```    
    
Availables options:

Property      | Description
------------- | -------------
object        | a D3 html element, it will be used as placeholder to load the graph. This option is mandatory
workingtimes  | A function called to load the working times on the specified interval. The function must return a Q promise. This option is mandatory
events        | A function called to load some events on the specified interval. The function must return a Q promise. This option is mandatory
onUpdated     | A function called when the selection is modified, the selection is given as a parameter. This option is mandatory
focusDate     | A Date object, the graph will be open at this date, if not set, the default value is the current date
dateLocale    | A string to represent the locale used in dates functions, default is 'FR_fr'
width         | An integer for the graph width, default is the size of parent container
    
Add some bottom timeline references using the timeline object:
```javascript
    var timeline = new Timeline('My timeline', function(interval) {
    
    });
    
    teleperiod.addTimeLine(timeline);
``` 

Draw the widget:
```javascript
    teleperiod.draw();
``` 

Set a selected period for modifications:
```javascript
    teleperiod.setSelection(
        new Date(2015, 1, 10, 0, 0, 0),
        new Date(2015, 1, 11, 0, 0, 0)
    );
``` 


Usage exemples
--------------

Room reservations, vacation periods request, resources management ...
