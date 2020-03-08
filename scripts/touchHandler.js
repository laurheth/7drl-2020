class touchHandler {
    constructor(element, playerRef) {
        this.playerRef = playerRef;

        this.reset();

        this.minLength = 20; // pixels
        this.maxTime = 1000; // milliseconds
        this.ratioNeeded = 1.5; // Diagonal swipes are ambiguous! Ratio needed for clarity

        element.addEventListener("touchstart", (event) => this.handleStart(event),true);
        element.addEventListener("touchmove", (event) => this.handleMove(event), true);
        element.addEventListener("touchend", (event) => this.handleEnd(event), true);
        element.addEventListener("touchcancel",(event)=>this.handleCancel(event),true);
    }

    handleStart(event) {
        event.preventDefault();

        this.reset();

        const touch = event.changedTouches[0];
        this.startPos = [touch.pageX, touch.pageY]; // store where the swipe started
        this.startTime = (new Date()).getTime();
    }

    handleMove(event) {
        event.preventDefault();
        const touch = event.changedTouches[0];
        this.endPos = [touch.pageX, touch.pageY]; // store where the swipe ends
    }

    handleCancel(event) {
        event.preventDefault();
        this.reset();
    }
    
    handleEnd(event) {
        event.preventDefault();
        try {
            const endTime = (new Date()).getTime();
            const delta = [this.endPos[0]-this.startPos[0],this.endPos[1]-this.startPos[1]];
    
            if ((endTime - this.startTime) < this.maxTime && Math.sqrt(delta[0]**2 + delta[1]**2) > this.minLength) {
                if (Math.abs(delta[0] / delta[1]) > this.ratioNeeded) {
                    if (delta[0] > 0) {
                        this.sendSwipe('Right');
                    }
                    else {
                        this.sendSwipe('Left');
                    }
                }
                else if (Math.abs(delta[1] / delta[0]) > this.ratioNeeded) {
                    if (delta[1] > 0) {
                        this.sendSwipe('Down');
                    }
                    else {
                        this.sendSwipe('Up');
                    }
                }
            }
        }
        catch(err) {
            // The swipe broke. This is typically because the it ended prematurely/endPos doesn't exist for some reason, etc. Just ignore it.
        }

        this.reset();
    }
    reset() {
        // Reset numbers
        this.startPos = null;
        this.endPos = null;
        this.startTime = null;
    }

    // Easiest way seems to me to just build a custom event object and send it the same place keys go
    sendSwipe(swipeString) {
        const myEvent = {
            key:swipeString,
            preventDefault:()=>{}
        }
        this.playerRef.handleEvent(myEvent);
    }
}

export default touchHandler;