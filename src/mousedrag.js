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


    // additional width added when backwardGrow() or forwardGrow()
    var additionalWidth = (teleperiod.getMoveDays() * teleperiod.getDateWidth());

    var mouseDrag = this;

    var x,
        newX,
        gapDaysBackward,
        hiddenPart,
        gapDaysForward,
        backwardTotal = 0;


    this.dragmove = function dragMove() {
        x = d3.mouse(teleperiod.viewport.node())[0];

        // relative x from the mouse origin
        newX = x - xStart;

        // numbers of days between main x and viewport x
        gapDaysBackward = Math.ceil((-1 * (newX + currentX))/teleperiod.getMoveDays());



        hiddenPart = (-1*newX + Math.abs(currentX) + backwardTotal);

        // number of days between main end and viewport end
        gapDaysForward = Math.ceil((currentWidth - hiddenPart - teleperiod.getWidth())/teleperiod.getDateWidth()) -1;

        teleperiod.main.attr('x', function() {

            if (gapDaysBackward < 0) {
                // before viewportFrom with at least one day
                teleperiod.backwardGrow();
                currentX -= additionalWidth;
                backwardTotal -= additionalWidth;
                console.log('backwardGrow '+gapDaysBackward);
            }


            if (gapDaysForward < 0) {
                teleperiod.forwardGrow();
                currentWidth += additionalWidth;
                console.log('forwardGrow '+gapDaysForward);
            }

            return (currentX + newX);
        });
    };
}
