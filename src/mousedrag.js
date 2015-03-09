/**
 * A mouse drag action
 * A new MouseDrag object is created for each click on the main frame, the dragmove method is called while moving the frame left or right
 *
 * @param {teleperiod}   teleperiod
 *
 */
function MouseDrag(teleperiod) {

    'use strict';

    var xStart = d3.mouse(teleperiod.viewport.node())[0];
    var currentX = parseInt(teleperiod.main.attr('x'), 10);
    var currentWidth = parseInt(teleperiod.main.attr("width"), 10);
    var viewportWidth = parseInt(teleperiod.viewport.attr('width'), 10);

     var viewportX = teleperiod.viewport.attr('x');

    if (null === viewportX) {
        viewportX = 0;
    } else {
        viewportX = parseInt(viewportX, 10);
    }

    // additional width added when backwardGrow() or forwardGrow()
    var additionalWidth = (teleperiod.getMoveDays() * teleperiod.getDateWidth());

    var mouseDrag = this;

    var x, newX;


    /**
     * Get the distance from the main sliding frame to the fixed viewport
     * positive if the main frame left x position is lower than the viewport left x position
     * @return {Int}
     */
    this.getLeftDistance = function() {

        var main = teleperiod.main.attr('x');

        if (null === main) {
            main = 0;
        } else {
            main = parseInt(main, 10);
        }

        return (viewportX - main);
    };


    /**
     * Get the distance from the main sliding frame to the fixed viewport
     * positive if the main frame right x position is higher than the viewport right x position
     * @return {Int}
     */
    this.getRightDistance = function() {

        var viewport = viewportX + viewportWidth;

        var main = teleperiod.main.attr('x');
        if (null === main) {
            main = 0;
        } else {
            main = parseInt(main, 10);
        }


        var realCurrentWidth = parseInt(teleperiod.main.attr('width'), 10);

        main += realCurrentWidth;

        console.log('viewport '+viewport+' x '+teleperiod.main.attr('x')+' realCurrentWidth '+realCurrentWidth);

        return (main - viewport);
    };



    this.dragmove = function dragMove() {
        x = d3.mouse(teleperiod.viewport.node())[0];

        // relative x from the mouse origin
        newX = x - xStart;

        if (mouseDrag.getLeftDistance() < 0) {
            // before viewportFrom with at least one day
            if (teleperiod.backwardGrow()) {
                currentX -= additionalWidth;
                console.log('---');
            }
        }


        if (mouseDrag.getRightDistance() < 0) {
            if (teleperiod.forwardGrow()) {
                currentWidth += additionalWidth;
                console.log('+++');
                teleperiod.forwardGrow();
            }
        }


        teleperiod.main.attr('x', (currentX + newX));
    };
}
