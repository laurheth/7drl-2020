import Entity from './entity.js';

class Doodad extends Entity {
    constructor(startPosition, type) {
        switch(type) {
            default:
            case 'barrel': {
                super(startPosition,'Ξ','black','orangered');
                this.hitpoints = 1;
                this.damage=5;
                this.force=8;
                this.mass=1;
                this.blastRadius=5;
                this.name='explosive barrel';
                this.explosive=true;
                break;
            }
        }
        this.noDirectDamage=true;
    }
}

export default Doodad;