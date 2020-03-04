import Entity from './entity.js';
import gameBoard from './gameBoard.js';
import map from './map.js';
import actionQueue from './actionQueue.js';

// const player = new entity([15,15],'@');
class Player extends Entity {
    constructor(startPosition) {
        super(startPosition,'@');
        gameBoard.jumpToPosition(startPosition);
        document.addEventListener('keydown',(event)=>this.handleEvent(event));
        map.vision(this.position);
        this.playerTurn=false;
        this.nameElement = document.getElementById('name');
        this.nameElement.textContent='Lauren';

        this.hp=20;
        this.maxHp=20;

        this.hpElement = document.getElementById('hp');
        this.hpElement.textContent = `${this.hp}/${this.maxHp}`;

        this.equipmentElement = document.getElementById('equipment');
        this.equipmentElement.textContent = `Baseball bat`;
    }
    handleEvent(event) {
        // console.log(event);
        if (this.playerTurn) {
            let eventCaptured = true;
            let acted=false;
            switch(event.key) {
                case 'ArrowRight':
                    acted=this.step(1,0,0);
                    break;
                case 'ArrowLeft':
                    acted=this.step(-1,0,0);
                    break;
                case 'ArrowUp':
                    acted=this.step(0,-1,0);
                    break;
                case 'ArrowDown':
                    acted=this.step(0,1,0);
                    break;
                case '>':
                    if (map.getTile(this.position) && map.getTile(this.position).isDownStair()) {
                        acted=this.step(0,0,-1);
                    }
                    break;
                case '<':
                    if (map.getTile(this.position) && map.getTile(this.position).isUpStair()) {
                        acted=this.step(0,0,1);
                    }
                    break;
                default:
                    // Don't change anything
                    eventCaptured=false;
                    break;
            }
            if (eventCaptured) {
                event.preventDefault();
            }
            if (acted) {
                this.playerTurn=false;
                map.vision(this.position);
                actionQueue.advance();
            }
        }
    }
    setPosition(position) {
        if (this.position) {
            map.clearVision(this.position);
        }
        if (position[2] !== gameBoard.currentLevel) {
            gameBoard.currentLevel = position[2];
            map.display(position[2]);
        }
        super.setPosition(position);
        gameBoard.setViewPosition(position);
    }
    act() {
        this.playerTurn=true;
    }
}

export default Player;