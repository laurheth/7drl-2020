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
            default:
                super(startPosition,'g','black','green');
                this.hitpoints = 10;
                this.damage=2;
                this.name='The goblin';
                this.ai=ai.CHASE;
        }
        this.target=null;
        this.active = -1;
    }
    act() {
        this.active--;
        if (this.active > 0 && map.player && this.position[2] === map.player.position[2] && this.ai in ai) {
            switch(this.ai) {
                default:
                case ai.CHASE:
                    let direction = this.getDirection(this.target);
                    // console.log(direction);
                    if (!this.step(direction[0],direction[1],0)) {
                        direction = this.getDirection(this.target,false);
                        if (!this.step(direction[0],direction[1],0)) {
                            let breaker=5;
                            while (breaker>0 && !this.step(direction[0],direction[1],0)) {
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
        
        actionQueue.advance();
    }
    show() {
        super.show();
        this.active = 10;
        if (map.player) {
            this.target=[...map.player.position];
        }
    }
    attack(entity) {
        if (this.currentTile && this.currentTile.isVisible()) {
            gameBoard.sendMessage(this.getName() + ' attacks ' + entity.getName(false) + '!');
        }
        super.attack(entity);
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