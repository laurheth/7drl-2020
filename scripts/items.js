class Item {
    constructor(name,character,color,type,durability=Infinity) {
        this.name=name;
        this.character=character;
        this.color=color;
        this.type=type; // weapon/tool, or passive, or consumable
        this.durability=durability;
        this.unique=false;
    }
    damage(damage) {
        this.durability -= damage;
        return this.durability > 0;
    }
    getDurability() {
        return this.durability;
    }
    getName(capitalize=true) {
        if (capitalize || this.unique) {
            return this.name;
        }
        else {
            return this.name.toLowerCase();
        }
    }
}

class Weapon extends Item {
    constructor(name,character,color,damage,force,durability) {
        super(name,character,color,'tool');
        this.dmg=damage;
        this.force=force;
        this.durability=durability;
    }
    getDamage() {
        return this.dmg;
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
    getMass() {
        return this.mass;
    }
}

class Consumable extends Item {
    constructor(name,character,color,effect,verb) {
        super(name,character,color,'consumable');
        this.effect = effect;
        this.useVerb=verb;
    }
    consume() {
        return this.effect;
    }
    getVerb() {
        return this.useVerb;
    }
}

const getItem = (type) => {
    switch(type) {
        case 'potion':
            return new Consumable('Healing potion','!','red',{heal:20},'quaff');
        case 'smallfood':
            return new Consumable('Apple','%','red',{heal:2,food:5},'eat');
        case 'mediumfood':
            return new Consumable('Sandwich','%','burlywood',{heal:3,food:10},'eat');
        case 'bigfood':
            return new Consumable("Bowl of chilli",'%','white',{heal:4,food:20},'eat');
        case 'weighted':
            return new Armor('Stone armor','[','burlywood',2,40,5);
        case 'plate':
            return new Armor('Plate armor','[','cyan',3,40,1);
        case 'chain':
            return new Armor('Chain armor','[','gray',2,30,0.5);
        case 'leather':
            return new Armor('Leather armor','[','brown',1,20,0.1);
        case 'sixela':
            const sixela = new Weapon('Legendary Hammer of Sixela','yellow',3,20,Infinity);
            sixela.unique=true;
            return sixela;
        case 'sonic mallet':
            return new Weapon('Sonic mallet','/','pink',2,10,100);
        case 'golf club':
            return new Weapon('Golf club','/','cyan',1,6,60);
        case 'sword':
            return new Weapon('Sword','/','white',4,0,60);
        case 'bat':
            return new Weapon('Baseball bat','/','brown',1,4,40);
        default:
        case 'hands':
            return new Weapon('Fists','/','brown',1,0,Infinity);
    }
}

export default getItem;