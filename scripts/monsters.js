import Entity from './entity.js';
import random from './random.js';
import actionQueue from './actionQueue.js';
import gameBoard from './gameBoard.js';
import map from './map.js';

const ai = {
    CHASE:'CHASE',
}

const directions = [[0,1],[0,-1],[1,0],[-1,0]];

class Monster extends Entity {
    constructor(startPosition, type) {
        switch(type) {
            case 'splodey':
                super(startPosition,'s','black','orange');
                this.hitpoints = 5;
                this.damage=1;
                this.force=1;
                this.mass=1;
                this.explosive=true;
                this.blastMultiplier=4;
                this.blastRadius=4;
                this.name='splodey boi';
                this.ai=ai.CHASE;
                break;
            case 'spikeman':
                super(startPosition,'X','black','hotpink');
                this.hitpoints = 30;
                this.damage=8;
                this.force=1;
                this.mass=2;
                this.name='spikey man';
                this.ai=ai.CHASE;
                break;
            case 'spike':
                super(startPosition,'x','black','red');
                this.hitpoints = 10;
                this.damage=4;
                this.force=0.1;
                this.mass=0.5;
                this.name='spikey boi';
                this.ai=ai.CHASE;
                break;
            case 'large orb':
                super(startPosition,'O','black','yellow');
                this.hitpoints = 20;
                this.damage=4;
                this.force=6;
                this.mass=4;
                this.name='large orb';
                this.ai=ai.CHASE;
                break;
            default:
            case 'small orb':
                super(startPosition,'o','black','white');
                this.hitpoints = 10;
                this.damage=2;
                this.force=2;
                this.mass=1;
                this.name='small orb';
                this.ai=ai.CHASE;
                break;
        }
        this.awake=false;
        this.target=null;
        this.active = -1;
    }
    validStep(direction) {
        if (direction.length===2) {
            direction.push(0);
        }
        let testPosition = this.position.map((x,i)=>x+direction[i]);
        if (map.getTile(testPosition) && !map.getTile(testPosition).isEmpty()) {
            return true;
        }
        else {
            testPosition[2]-=1;
            if (map.getTile(testPosition) && !map.getTile(testPosition).isPassable()) {
                return true;
            }
        }
        return false;
    }
    act() {
        this.active--;
        if (this.awake) {
            if (this.active > 0 && map.player && this.position[2] === map.player.position[2] && this.ai in ai) {
                switch(this.ai) {
                    default:
                    case ai.CHASE:
                        let getBest = (random.random()>0.25);
                        let direction = this.getDirection(this.target,getBest);
                        if (!this.validStep(direction) || !this.step(direction[0],direction[1],0)) {
                            direction = this.getDirection(this.target,!getBest);
                            if (!this.validStep(direction) || !this.step(direction[0],direction[1],0)) {
                                let breaker=5;
                                while (breaker>0 && (!this.validStep(direction) || !this.step(direction[0],direction[1],0))) {
                                    breaker--;
                                    direction = random.selection(directions);
                                }
                            }
                        }
                }
            }
            else {
                // Wander
                let breaker=10;
                let dx=0;
                let dy=0;
                while (breaker>0 && !this.step(dx,dy,0)) {
                    dx = random.range(-1,1);
                    dy = random.range(-1,1);
                    breaker--;
                }
            }

        }
        else if (this.active > 0 && map.player && this.position[2] === map.player.position[2] && this.ai in ai) {
            gameBoard.sendMessage('You hear a shout!');
            this.awake=true;
        }
        
        actionQueue.advance();
    }
    show() {
        super.show();
        this.active = 10;
        if (map.player) {
            this.target=[...map.player.position];
        }
    }
    attack(entity, forced=false, silent=false) {
        if (entity === map.player && !forced) {
            if (this.currentTile && this.currentTile.isVisible() && !silent) {
                gameBoard.sendMessage(this.getName() + ' attacks ' + entity.getName(false) + '!');
            }
            super.attack(entity);
        }
        else {
            if (this.currentTile && this.currentTile.isVisible()  && !silent) {
                if (forced) {
                    gameBoard.sendMessage(this.getName() + ' collides with ' + entity.getName(false) + '!');
                }
                else {
                    gameBoard.sendMessage(this.getName() + ' pushes ' + entity.getName(false) + '!');
                }
            }
            if (forced) {
                super.attack(entity,forced && entity !== map.player);
            }
            else {
                this.push(entity);
            }
        }
        return true;
    }
    getDirection(target, best=true) {
        const direction = [0,0];
        if (best) {
            if (Math.abs(this.position[0]-target[0]) > Math.abs(this.position[1]-target[1])) {
                direction[0] = Math.sign(target[0] - this.position[0]);
            }
            else {
                direction[1] = Math.sign(target[1] - this.position[1]);   
            }
        }
        else {
            if (Math.abs(this.position[0]-target[0]) <= Math.abs(this.position[1]-target[1])) {
                direction[0] = Math.sign(target[0] - this.position[0]);
            }
            else {
                direction[1] = Math.sign(target[1] - this.position[1]);   
            }
        }
        return direction;
    }
}

export default Monster;