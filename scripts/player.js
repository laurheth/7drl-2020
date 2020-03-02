import Entity from './entity.js';
import gameBoard from './gameBoard.js';

// const player = new entity([15,15],'@');
class Player extends Entity {
    constructor() {
        super([15,15],'@');
        document.addEventListener('keydown',(event)=>this.handleEvent(event));
    }
    handleEvent(event) {
        console.log(event);
        let eventCaptured = true;
        switch(event.key) {
            case 'ArrowRight':
                this.step(1,0);
                break;
            case 'ArrowLeft':
                this.step(-1,0);
                break;
            case 'ArrowUp':
                this.step(0,-1);
                break;
            case 'ArrowDown':
                this.step(0,1);
                break;
            default:
                // Don't change anything
                eventCaptured=false;
                break;
        }
        if (eventCaptured) {
            event.preventDefault();
        }
    }
    setPosition(position) {
        super.setPosition(position);
        gameBoard.setViewPosition(position);
    }
}

export default Player;