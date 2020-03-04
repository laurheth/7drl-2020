import Entity from './entity.js';
import gameBoard from './gameBoard.js';
import map from './map.js';

// const player = new entity([15,15],'@');
class Player extends Entity {
    constructor(startPosition) {
        super(startPosition,'@');
        gameBoard.jumpToPosition(startPosition);
        document.addEventListener('keydown',(event)=>this.handleEvent(event));
        map.vision(this.position);
    }
    handleEvent(event) {
        console.log(event);
        let eventCaptured = true;
        switch(event.key) {
            case 'ArrowRight':
                this.step(1,0,0);
                break;
            case 'ArrowLeft':
                this.step(-1,0,0);
                break;
            case 'ArrowUp':
                this.step(0,-1,0);
                break;
            case 'ArrowDown':
                this.step(0,1,0);
                break;
            case '>':
                if (map.getTile(this.position) && map.getTile(this.position).isDownStair()) {
                    this.step(0,0,-1);
                }
                break;
            case '<':
                if (map.getTile(this.position) && map.getTile(this.position).isUpStair()) {
                    this.step(0,0,1);
                }
                break;
            default:
                // Don't change anything
                eventCaptured=false;
                break;
        }
        if (eventCaptured) {
            event.preventDefault();
            map.vision(this.position);
        }
    }
    setPosition(position) {
        if (position[2] !== gameBoard.currentLevel) {
            gameBoard.currentLevel = position[2];
            map.display(position[2]);
        }
        super.setPosition(position);
        gameBoard.setViewPosition(position);
    }
}

export default Player;