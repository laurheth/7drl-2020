class Item {
    constructor(name,character,color,type,durability=Infinity) {
        this.name=name;
        this.character=character;
        this.color=color;
        this.type=type; // weapon/tool, or passive, or consumable
        this.durability=durability;
    }
    damage(damage) {
        this.durability -= damage;
        return this.durability > 0;
    }
    getDurability() {
        return this.durability;
    }
}

class Weapon extends Item {
    constructor(name,character,color,damage,force) {
        super(name,character,color,'tool');
        this.damage=damage;
        this.force=force;
    }
    getDamage() {
        return this.damage;
    }
    getForce() {
        return this.force;
    }
}

class Armor extends Item {
    constructor(name,character,color,armor,durability,mass) {
        super(name,character,color,'armor');
        this.armor=armor;
        this.durability=durability;
        this.mass=mass;
    }
    protect(damage) {
        if (damage <= this.armor) {
            return Math.min(damage,this.durability);
        }
        else {
            return Math.min(this.armor,this.durability);
        }
    }
}

class Consumable extends Item {
    constructor(name,character,color,effect) {
        super(name,character,color,'consumable');
        this.effect = effect;
    }
    consume() {
        return this.effect;
    }
}

const getItem = (type) => {
    switch(type) {
        case 'potion':
            return new Consumable('Healing potion','!','red',{heal:20});
        case 'weighted':
            return new Armor('Stone armor','[','burlywood',2,40,5);
        case 'plate':
            return new Armor('Plate armor','[','cyan',3,40,1);
        case 'chain':
            return new Armor('Chain armor','[','gray',2,30,0.5);
        case 'leather':
            return new Armor('Leather armor','[','brown',1,20,0.1);
        case 'sixela':
            return new Weapon('Legendary Hammer of Sixela','yellow',3,20);
        case 'sonic mallet':
            return new Weapon('Sonic mallet','/','pink',2,10);
        case 'golf club':
            return new Weapon('Golf club','/','cyan',1,6);
        case 'sword':
            return new Weapon('Sword','/','white',4,0);
        case 'bat':
            return new Weapon('Baseball bat','/','brown',1,4);
        default:
        case 'hands':
            return new Weapon('Fists','/','brown',1,0);
    }
}

export default getItem;