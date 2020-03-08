import map from "./map.js";
import Entity from './entity.js';
import actionQueue from './actionQueue.js';
import gameBoard from './gameBoard.js';
// import map from './map.js';

class Item {
    constructor(name,character,color,type,durability=Infinity,useVerb='use') {
        this.name=name;
        this.character=character;
        this.color=color;
        this.type=type; // weapon/tool, or passive, or consumable
        this.durability=durability;
        this.maxDurability=durability;
        this.unique=false;
        this.special=null;
        this.useVerb=useVerb;
    }
    damage(damage) {
        this.durability -= damage;
        return this.durability > 0;
    }
    getDurability() {
        return this.durability;
    }
    getDurabilityFraction() {
        if (isFinite(this.durability)) {
            return this.durability / this.maxDurability;
        }
        else {
            return Infinity;
        }
    }
    getName(capitalize=true) {
        if (capitalize || this.unique) {
            return this.name;
        }
        else {
            return this.name.toLowerCase();
        }
    }
    getVerb() {
        return this.useVerb;
    }
}

class Weapon extends Item {
    constructor(name,character,color,damage,force,durability) {
        super(name,character,color,'tool',durability,'equip');
        this.dmg=damage;
        this.force=force;
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
        super(name,character,color,'armor',durability,'wear');
        this.armor=armor;
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
        super(name,character,color,'consumable',verb);
        this.effect = effect;
    }
    consume() {
        return this.effect;
    }
}

// Accepts two callback functions
const shoot = (user,perTile,direction, endFunction,range=8) => {
    const startPosition = user.position;
    const position = [...startPosition];
    const tested=[[...position]];
    let success=false;
    while(!success && tested.length<range) {
        position[0]+=direction[0];
        position[1]+=direction[1];
        tested.push([...position]);
        success = perTile(position);
    }
    endFunction(user,tested,success);
}

const rocketSpecial = (user, direction,damage=8,force=8,radius=4,range=12) => {
    shoot(user,(position)=>{
        return !(map.getTile(position) && map.getTile(position).isPassable());
    },direction,(user,path,hit)=>{
        let rocket = null;
        if (path.length>2) {
            rocket = new Entity(path[1],'*','black','red',false);
            rocket.explosive=true;
            rocket.damage=damage;
            rocket.force=force;
            rocket.blastRadius=radius;
            rocket.name="rocket";
            rocket.hitpoints=1;
            rocket.knockBack([path[1][0]-path[0][0], path[1][1]-path[0][1], 0],path.length*2);
        }
        else {
            rocket = new Entity(path[1],'*','black','red',true);
            rocket.explosive=true;
            rocket.damage=damage;
            rocket.force=force;
            rocket.blastRadius=radius;
            rocket.name="The rocket";
            rocket.die();
        }
    },range);
};

const hookSpecial = (user,direction,damage=1,force=8,range=8) => {
    actionQueue.addLock(user);
    const interval=50;
    let time=0;
    shoot(user,(position)=>{
        const thisPosition=[...position];
        time+=interval;
        setTimeout(()=>{
            gameBoard.setTile([thisPosition[0],thisPosition[1]],'*','black','gray')
        },time);
        const tile = map.getTile(position);
        return !(tile && tile.isPassable() && !tile.isUpStair() && !tile.isDownStair());
    },direction,(user,path,hit)=>{
        if (hit) {
            const tile = map.getTile(path[path.length-1]);
            const direction = [path[1][0]-path[0][0], path[1][1]-path[0][1],0];
            if (tile && tile.entity) {
                setTimeout(()=>{
                    if (!tile.entity.noDirectDamage) {
                        tile.entity.hurt(damage);
                    }
                    if (tile.entity) {
                        tile.entity.knockBack(direction,Math.ceil(force/tile.entity.getMass()));
                    }
                },time);
                path.reverse().forEach(position=>{
                    time+=interval;
                    setTimeout(()=>map.revertTile(...position),time);
                });
                time+=interval;
                setTimeout(()=>actionQueue.removeLock(user),time);
            }
            else {
                time+=interval;
                let hookDistance = path.length-2;
                const lastTile=map.getTile(path[path.length-1]);
                if (lastTile && (lastTile.isUpStair() || lastTile.isDownStair())) {
                    hookDistance++;
                }
                setTimeout(()=>{
                    path.forEach(position=>map.revertTile(...position))
                    user.knockBack(direction,hookDistance);
                },time);
            }
        }
        else {
            path.reverse().forEach(position=>{
                time+=interval;
                setTimeout(()=>map.revertTile(...position),time);
            });
            time+=interval;
            setTimeout(()=>actionQueue.removeLock(user),time);
        }
    },range);
};

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
            return new Armor('Stone armor','[','burlywood',2,60,10);
        case 'plate':
            return new Armor('Plate armor','[','cyan',3,120,1);
        case 'chain':
            return new Armor('Chain armor','[','gray',2,60,0.5);
        case 'leather':
            return new Armor('Leather armor','[','brown',1,20,0.1);
        case 'jetpack':
            const jetpack = new Armor('Jetpack','[','pink',0,101,0.1);
            jetpack.flying=true;
            jetpack.fuelCost=5;
            jetpack.message = "This jetpack enables flight! Wear it to be able to fly across holes, hover, or ascend and descend at will. Be mindful of your fuel, though.";
            return jetpack;
        case 'sixela':
            const sixela = new Weapon('Legendary Hammer of Sixela','/','yellow',3,20,Infinity);
            sixela.unique=true;
            return sixela;
        case 'rocket':
            const rocket=new Weapon('Rocket launcher', '/','red',1,2,200);
            rocket.special = {
                name: 'Fire the rocket launcher.',
                activate: (user,direction) => {
                    rocketSpecial(user,direction);
                    rocket.damage(40);
                }
            }
            rocket.message = "This rocket launcher fires rockets! Equip it then select 'Fire the rocket launcher' or press 'f' to fire!";
            return rocket;
        case 'hookshot':
            const hookshot = new Weapon('Hook shooter','/','cyan',1,2,240);
            hookshot.special = {
                name: 'Fire the hook shooter.',
                activate: (user,direction) => {
                    hookSpecial(user,direction,2,8,12);
                    hookshot.damage(10);
                }
            }
            hookshot.message = "The hook shooter fires hooks! Equip it then select 'Fire the hook shooter' or press 'f' to grapple onto distant walls!";
            return hookshot;
        case 'sonic mallet':
            return new Weapon('Sonic mallet','/','pink',2,10,100);
        case 'golf club':
            return new Weapon('Golf club','/','gray',1,6,60);
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