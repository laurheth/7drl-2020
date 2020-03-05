import Entity from './entity.js';
import gameBoard from './gameBoard.js';
import map from './map.js';
import actionQueue from './actionQueue.js';
import mapGenerator from './mapGenerator.js';

// const player = new entity([15,15],'@');
class Player extends Entity {
    constructor(startPosition) {
        super(startPosition,'@');
        gameBoard.jumpToPosition(startPosition);
        document.addEventListener('keydown',(event)=>this.handleEvent(event));
        map.vision(this.position);
        this.playerTurn=false;
        this.name='You';
        this.nameElement = document.getElementById('name');
        this.nameElement.textContent='Lauren';

        this.hitpoints=20;
        this.maxHp=20;
        this.damage=1;
        this.force=4;
        this.mass=2;
        this.healRate=10;

        this.visitedLevels=[0];

        this.hpElement = document.getElementById('hp');

        this.equipmentElement = document.getElementById('equipment');
        this.updateStatus();
    }
    handleEvent(event) {
        // console.log(event);
        if (this.playerTurn && this.alive) {
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
                case '.':
                    acted=true;
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
        } else {
            event.preventDefault();
        }
    }
    setPosition(position) {
        if (this.position) {
            map.clearVision(this.position);
        }
        super.setPosition(position);
        if (this.position[2] !== gameBoard.currentLevel) {
            gameBoard.currentLevel = this.position[2];
            if (this.visitedLevels.indexOf(this.position[2]) < 0) {
                this.visitedLevels.push(this.position[2]);
                mapGenerator.populateLevel(map.levels[this.position[2]],this.position[2]);
            }
            map.display(this.position[2]);
        }
        map.vision(this.position);
        gameBoard.setViewPosition(this.position);
    }
    act() {
        if (this.alive) {
            this.turnCount++;
            if (this.turnCount % this.healRate === 0) {
                if (this.hitpoints < this.maxHp) {
                    this.hitpoints++;
                    this.updateStatus();
                }
            }
            this.playerTurn=true;
        }
        else {
            gameBoard.sendMessage("You die...");
            actionQueue.stop();
        }
        map.vision(this.position);
    }
    updateStatus() {
        this.hpElement.textContent = `${this.hitpoints}/${this.maxHp}`;
        this.equipmentElement.textContent = `Baseball bat`;
    }
    attack(entity) {
        gameBoard.sendMessage(this.getName() + ' attack ' + entity.getName(false) + '!');
        super.attack(entity);
        return true;
    }
    hurt(dmg) {
        super.hurt(dmg);
        this.updateStatus();
    }
    die() {
        this.alive=false;
        this.updateStatus();
    }
    knockBack(direction, tiles) {
        super.knockBack(direction, tiles);
        map.vision(this.position);
    }
    getName(capitalize=true) {
        if (capitalize) {
            return this.name;
        }
        else {
            return this.name.toLowerCase();
        }
    }

    collideMessage(targetTile) {
        gameBoard.sendMessage(this.getName()+' crash into '+targetTile.getName(false)+'!');
    }
}

export default Player;