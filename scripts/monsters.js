import Entity from './entity.js';
import random from './random.js';
import actionQueue from './actionQueue.js';
import gameBoard from './gameBoard.js';
import map from './map.js';

const ai = {
    CHASE:'CHASE',
    ROAMBO:'ROAMBO',
}

const directions = [[0,1],[0,-1],[1,0],[-1,0]];

class Monster extends Entity {
    constructor(startPosition, type) {
        let persistence=10;
        switch(type) {
            case 'roambo':
                super(startPosition,'r','black','white');
                this.hitpoints = 5;
                this.damage=1;
                this.force=1;
                this.mass=1;
                this.explosive=true;
                this.blastMultiplier=5;
                this.blastRadius=5;
                this.name='roambo';
                this.ai=ai.ROAMBO;
                break;
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
            case 'spikemom':
                super(startPosition,'&','black','yellow');
                this.hitpoints = 100;
                this.damage=10;
                this.force=6;
                this.mass=10;
                this.name='Spike Mom';
                this.pronoun=true;
                this.ai=ai.CHASE;
                persistence=Infinity;
                this.omniscient=true;
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
            case 'drone':
                super(startPosition,'d','black','cyan');
                this.hitpoints = 7;
                this.damage=1;
                this.force=1;
                this.mass=0.5;
                this.name='drone';
                this.flying=true;
                this.ai=ai.CHASE;
                break;
            case 'large orb':
                super(startPosition,'O','black','yellow');
                this.hitpoints = 20;
                this.damage=4;
                this.force=6;
                this.mass=4;
                this.name='spherical cow';
                this.ai=ai.CHASE;
                break;
            default:
            case 'small orb':
                super(startPosition,'o','black','white');
                this.hitpoints = 10;
                this.damage=2;
                this.force=2;
                this.mass=1;
                this.name='orb';
                this.ai=ai.CHASE;
                break;
        }
        this.persistence=persistence;
        this.awake=false;
        this.target=null;
        this.active = -1;
    }
    validStep(direction) {
        if (direction.length===2) {
            direction.push(0);
        }
        let testPosition = this.position.map((x,i)=>x+direction[i]);
        if (map.getTile(testPosition) && (this.canFly() || !map.getTile(testPosition).isEmpty())) {
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
        if (this.awake && Math.abs(this.position[2] - map.player.position[2]) < Math.max(2,this.active)) {
            if ((this.active > 0 && map.player && this.ai in ai) || this.ai === ai.ROAMBO) {
                switch(this.ai) {
                    case ai.ROAMBO:
                        if (!this.currentDirection || random.random()>0.95) {
                            this.currentDirection = random.selection(directions);
                        }
                        if (!this.validStep(this.currentDirection) || !this.step(this.currentDirection[0],this.currentDirection[1],0)) {
                            let breaker=5;
                            while (breaker>0 && (!this.validStep(this.currentDirection) || !this.step(this.currentDirection[0],this.currentDirection[1],0))) {
                                breaker--;
                                this.currentDirection = random.selection(directions);
                            }
                        }
                        if (this.currentTile && this.currentTile.isFloor()) {
                            this.currentTile.makeFloor();
                            map.updateTile(this.currentTile,...this.position);
                        }
                        break;
                    default:
                    case ai.CHASE:
                        if (this.omniscient) {
                            if (this.position[2] - map.player.position[2] > 3) {
                                const newPosition = this.findTile('isUpStair',map.player.position,12,32);
                                if (newPosition !== map.player.position) {
                                    this.setPosition(newPosition);
                                }
                            }
                            else if (this.position[2] - map.player.position[2] < -3) {
                                const newPosition = this.findTile('isDownStair',map.player.position,12,32);
                                if (newPosition !== map.player.position) {
                                    this.setPosition(newPosition);
                                }
                            }
                            else if (this.position[2] > map.player.position[2] && this.target && !map.getTile(this.target).isDownStair()) {
                                this.target = this.findTile('isDownStair',this.position,0,20);
                            }
                            else if (this.position[2] < map.player.position[2] && this.target && !map.getTile(this.target).isUpStair()) {
                                this.target = this.findTile('isUpStair',this.position,0,20);
                            }
                            else if (this.position[2] === map.player.position[2] && this.target.every((x,i)=>x===this.position[i])) {
                                this.target = [...map.player.position];
                            }
                        }
                        let getBest = (random.random()>0.25);
                        let direction = this.getDirection(this.target,getBest);
                        if (this.position[2] > map.player.position[2] && this.canDescend()) {
                            this.step(0,0,-1);
                        }
                        else if (this.position[2] < map.player.position[2] && this.canAscend()) {
                            this.step(0,0,1);
                        }
                        else if (!this.validStep(direction) || !this.step(direction[0],direction[1],0)) {
                            direction = this.getDirection(this.target,!getBest);
                            if (!this.validStep(direction) || !this.step(direction[0],direction[1],0)) {
                                let breaker=5;
                                while (breaker>0 && (!this.validStep(direction) || !this.step(direction[0],direction[1],0))) {
                                    breaker--;
                                    direction = random.selection(directions);
                                }
                            }
                        }
                        break;
                }
            }
            else {
                // Wander
                let breaker=5;
                let dx=0;
                let dy=0;
                while (breaker>0 && !this.validStep([dx,dy,0]) && !this.step(dx,dy,0)) {
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
    findTile(method, startPoint=null, minDistance=0, maxDistance=40) {
        let distance=minDistance;
        while (distance<maxDistance) {
            for (let i=-distance;i<distance;i++) {
                for (let j=-distance;j<distance;j++) {
                    if (Math.abs(i)!==distance && Math.abs(j) !== distance) {
                        continue;
                    }
                    const tile = map.getTile([startPoint[0]+i,startPoint[1]+j,startPoint[2]]);
                    if (tile && tile[method]()) {
                        return [startPoint[0]+i,startPoint[1]+j,startPoint[2]];
                    }
                }
            }
            distance++;
        }
        return startPoint;
    }
    show(force) {
        if (this.omniscient) {
            console.log('??');
        }
        super.show(force);
        this.active = this.persistence;
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