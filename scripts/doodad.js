import Entity from './entity.js';

class Doodad extends Entity {
    constructor(startPosition, type) {
        switch(type) {
            case 'candle':
                super(startPosition,'Ψ','black','yellow');
                this.hitpoints = 1;
                this.damage=3;
                this.force=1;
                this.mass=0.5;
                this.name='candelabrum';
                this.dieVerb='shatters';
                break;
            default:
            case 'statue':
                super(startPosition,'Ω','black','white');
                this.hitpoints = 4;
                this.damage=4;
                this.force=4;
                this.mass=4;
                this.name='statue';
                this.dieVerb='shatters';
                break;
            case 'chest':
                super(startPosition,'π','black','brown');
                this.hitpoints = 3;
                this.damage=1;
                this.force=1;
                this.mass=2;
                this.name='treasure chest';
                this.dieVerb='smashes open';
                break;
            case 'table':
                super(startPosition,'╤','black','white');
                this.hitpoints = 2;
                this.damage=1;
                this.force=1;
                this.mass=1;
                this.name='table';
                this.dieVerb='smashes apart';
                break;
            case 'barrel':
                super(startPosition,'Ξ','black','orangered');
                this.hitpoints = 1;
                this.damage=5;
                this.force=8;
                this.mass=1;
                this.blastRadius=5;
                this.name='explosive barrel';
                this.explosive=true;
                this.dieVerb='explodes';
                break;
        }
        this.noDirectDamage=true;
    }
}

export default Doodad;