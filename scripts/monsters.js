import Entity from './entity.js';
import random from './random.js';
import actionQueue from './actionQueue.js';

const ai = {
    WANDER:'wander',
}

class Monster extends Entity {
    constructor(startPosition, type) {
        switch(type) {
            default:
                super(startPosition,'g','black','green');
                this.hitpoints = 10;
                this.ai=ai.WANDER;
        }
    }
    act() {
        switch(this.ai) {
            default:
            case ai.WANDER:
                let breaker=10;
                let dx=0;
                let dy=0;
                while (breaker>0 && !this.step(dx,dy,0)) {
                    dx = random.range(-1,1);
                    dy = random.range(-1,1);
                    breaker--;
                }
                break;
        }
        actionQueue.advance();
    }
}

export default Monster;