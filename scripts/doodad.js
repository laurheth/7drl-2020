import Entity from './entity.js';
import getItem from './items.js';
import random from './random.js';
import gameBoard from './gameBoard.js';

const loot = (level) => {
    const weights = {
        'weighted': (level < 10) ? 1 : 2,
        'plate':(level < 18) ? 0 : 4,
        'chain': 2,
        'leather': (level < 5) ? 8 : 0,
        'sonic mallet':(level < 14) ? 0 : 4,
        'golf club': (level < 14) ? 8 : 1,
        'rocket':(level<5) ? 0 : 3,
        'hookshot':(level<5) ? 1 : ((level<15) ? 3 : 5),
        'jetpack':(level<14) ? 0 : 1
    }
    return random.weighted(weights);
};

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
                this.noDirectDamage=true;
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
                this.noDirectDamage=true;
                break;
            case 'chest':
                super(startPosition,'π','black','brown');
                this.hitpoints = 3;
                this.damage=1;
                this.force=1;
                this.mass=1;
                this.name='treasure chest';
                this.dieVerb='smashes open';
                this.dropLoot=getItem(loot(gameBoard.currentLevel));
                break;
            case 'table':
                super(startPosition,'╤','black','white');
                this.hitpoints = 2;
                this.damage=1;
                this.force=1;
                this.mass=1;
                this.name='table';
                this.dieVerb='smashes apart';
                this.noDirectDamage=true;
                break;
            case 'barrel':
                super(startPosition,'Ξ','black','orangered');
                this.hitpoints = 1;
                this.damage=5;
                this.force=5;
                this.mass=1;
                this.blastRadius=5;
                this.name='explosive barrel';
                this.explosive=true;
                this.dieVerb='explodes';
                this.noDirectDamage=true;
                break;
        }
    }
}

export default Doodad;