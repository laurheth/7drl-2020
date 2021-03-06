import Entity from './entity.js';
import gameBoard from './gameBoard.js';
import map from './map.js';
import actionQueue from './actionQueue.js';
import mapGenerator from './mapGenerator.js';
import getItem from './items.js';
import random from './random.js';
import touchHandler from './touchHandler.js';

// const player = new entity([15,15],'@');
class Player extends Entity {
    constructor(startPosition) {
        super(startPosition,'@');
        gameBoard.setViewPosition(startPosition);
        document.addEventListener('keydown',(event)=>this.handleEvent(event));
        map.vision(this.position);
        this.playerTurn=false;
        this.name='You';
        this.nameElement = document.getElementById('name');

        const vowels='aeiouy'.split('');
        const consonants='qwrtypsdfghjklzxcvbnm'.split('');
        let name='';
        for (let i=0;i<6;i++) {
            if (i%2 === 0) {
                name += random.selection(consonants);
            }
            else {
                name += random.selection(vowels);
            }
            if (i===0) {
                name = name.toUpperCase();
            }
        }

        const titles = ['Brave','Witty','Heroic','Anxious','Gamer','Hammerer','Batter','Strong','Stout','Adventurer','Exciting','Tall','Mysterious','Short','Hammerseeker','Stonehearted','Honest','Courageous','Quick','Rogue','Bold','Italic','Noble','Fierce','Red','Agile','Nimble','Kid','Wise','Cunning','Sufficient','Adequate','Intrepid'];


        this.nameElement.textContent=name + ' the '+random.selection(titles);

        this.touchHandler = new touchHandler(document.getElementById('gameWindow'),this);

        this.hitpoints=30;
        this.maxHp=30;
        this.damage=1;
        this.force=0.1;
        this.mass=2;
        this.healRate=10;

        this.specialActive=false;

        this.inventory=[];
        this.inventory.push(getItem('bat'));

        this.wielded=this.inventory[0];

        this.visitedLevels=[0];

        this.hpElement = document.getElementById('hp');

        this.inventoryElement = document.getElementById('inventory');
        this.equipedElement = document.getElementById('equiped');
        this.armorElement = document.getElementById('armor');
        this.actionElement = document.getElementById('actions');

        this.statsButton = document.getElementById('statsButton');

        this.levelElement = document.getElementById('level');

        this.armorElement.addEventListener('click',(event)=>{
            event.preventDefault();
            this.removeArmor();
        });

        this.winItem=null;

        this.equipedElement.addEventListener('click',(event)=>{
            event.preventDefault();
            this.removeWeapon();
        });

        this.updateStatus();
        this.updateInventory();
    }
    handleEvent(event) {

        if (this.playerTurn && this.alive && !this.won) {
            let eventCaptured = true;
            let acted=false;
            const tile=map.getTile(this.position);
            switch(event.key) {
                case 'Right':
                case 'ArrowRight':
                    acted=this.step(1,0,0);
                    break;
                case 'Left':
                case 'ArrowLeft':
                    acted=this.step(-1,0,0);
                    break;
                case 'Up':
                case 'ArrowUp':
                    acted=this.step(0,-1,0);
                    break;
                case 'Down':
                case 'ArrowDown':
                    acted=this.step(0,1,0);
                    break;
                case '>':
                    if (this.canDescend()) {
                        acted=this.step(0,0,-1);
                    }
                    break;
                case '<':
                    if (this.canAscend()) {
                        if (!tile.isUpStair() && this.canFly()) {
                            this.jetpack(2);
                        }
                        acted=this.step(0,0,1);
                    }
                    break;
                case '.':
                    acted=true;
                    break;
                case 'g':
                    if(tile && tile.item) {
                        this.pickUp(false);
                        acted=true;
                    }
                    break;
                case 'f':
                    if (this.wielded && this.wielded.special) {
                        this.activateSpecial(true);
                    }
                    break;
                case 'Esc':
                case 'Escape':
                    this.activateSpecial(false);
                    break;
                default:
                    // Don't change anything
                    eventCaptured=false;
                    break;
            }
            if (eventCaptured) {
                event.preventDefault();
            }
            if (acted) {
                this.endTurn();
            }
        } else if (this.alive && !this.won) {
            event.preventDefault();
        }
    }
    endTurn() {
        this.playerTurn=false;
        map.vision(this.position);
        actionQueue.advance();
    }
    setPosition(position) {
        if (this.position) {
            map.clearVision(this.position);
        }
        super.setPosition(position);
        if (this.position[2] !== gameBoard.currentLevel) {
            gameBoard.currentLevel = this.position[2];
            if (this.visitedLevels.indexOf(this.position[2]) < 0) {
                this.visitedLevels.push(this.position[2]);
                mapGenerator.populateLevel(map.levels[this.position[2]],this.position[2]);
            }
            map.display(this.position[2]);
            this.updateLevel();
        }
        map.vision(this.position);
        gameBoard.setViewPosition(this.position);
        if (this.winItem) {
            if (this.position[2]===0 && (this.position[0]<=1 || this.position[1]<=1 || this.position[0] >= mapGenerator.dimensions[0]-2 || this.position[1] >= mapGenerator.dimensions[1]-2)) {
                gameBoard.sendMessage("You have escaped alive with the Legendary Hammer of Sixela, and won the game! Congratulations!",['good','important'],true);
                actionQueue.stop();
                this.won=true;
            }
        }
    }
    act() {
        if (this.alive && !this.won) {
            this.turnCount++;
            if (!this.warningSent && this.hitpoints < this.maxHp/3) {
                gameBoard.sendMessage("*** LOW HITPOINT WARNING ***",'bad');
                this.warningSent=true;
            }
            else if (this.hitpoints > this.maxHp/3) {
                this.warningSent=false;
            }
            if (this.turnCount % this.healRate === 0 && this.healRate < 20) {
                if (this.hitpoints < this.maxHp) {
                    this.hitpoints++;
                    this.turnCount=0;
                    this.healRate++;
                    this.updateStatus();
                }
            }
            this.playerTurn=true;
            this.updateActions();
        }
        else {
            gameBoard.sendMessage("You die...",['bad','important'],true);
            actionQueue.stop();
        }
        map.vision(this.position);
    }
    updateStatus() {
        this.hpElement.textContent = `${this.hitpoints}/${this.maxHp}`;
    }

    fullItemDetailDisplay(item,element) {
        element.classList.remove('good','bad','okay');
        element.textContent = item.getName();
        let durability = item.getDurabilityFraction();
        if (durability > 0.5) {
            element.classList.add('good');
        }
        else if (durability < 0.25) {
            element.classList.add('bad');
        }
        else {
            element.classList.add('okay');
        }
        if (isFinite(durability)) {
            element.textContent += ` (${Math.round(100*durability)}%)`;
        }
    }

    updateInventoryElement(item,element) {
        if (item) {
            this.fullItemDetailDisplay(item,element);
        }
        else {
            element.classList.remove('good','bad','okay');
            element.textContent = 'None';
        }
    }

    updateLevel() {
        this.levelElement.textContent=`Level ${Math.round(this.position[2]+1)} of the Tower`;
    }

    updateInventory() {
        this.updateInventoryElement(this.armor, this.armorElement);
        this.updateInventoryElement(this.wielded, this.equipedElement);
        
        while(this.inventoryElement.firstChild) {
            this.inventoryElement.lastChild.remove();
        }
        // Sort things a bit
        this.inventory.sort((a,b)=>{
            return b.sortVal() - a.sortVal();
        });
        this.inventory.forEach((item,i)=>{
            if (item !== this.armor && item !== this.wielded) {
                const newElement = document.createElement('li');
                const nameElement = document.createElement('p');

                this.fullItemDetailDisplay(item,nameElement);

                const equipButton = document.createElement('button');
                equipButton.addEventListener('click',(event)=>{
                    event.preventDefault();
                    this.useItem(i);
                });
                equipButton.textContent = item.getVerb();

                
                newElement.appendChild(nameElement);
                newElement.appendChild(equipButton);

                if (item !== this.winItem) {
                    const dropButton = document.createElement('button');
                    dropButton.addEventListener('click',(event)=>{
                        event.preventDefault();
                        this.dropItem(i);
                    });
                    dropButton.textContent = 'Drop';
                    newElement.appendChild(dropButton);
                }
                this.inventoryElement.appendChild(newElement);
            }
        });
    }

    step(dx, dy, dz, forced=false,appliedForce=0) {
        if (this.specialActive && !forced) {
            if ((dx===0 && dy===0) || dz!==0) {
                return false;
            }
            else {
                gameBoard.sendMessage('You '+ this.wielded.special.name.toLowerCase());
                this.wielded.special.activate(this,[dx,dy,0]);
                if (this.wielded.getDurability() <= 0) {
                    this.inventory.splice(this.inventory.indexOf(this.wielded),1);
                    this.wielded=null;
                }
                this.specialActive=false;
                this.updateInventory();
                this.updateActions();
                return true;
            }
        }
        else {
            return super.step(dx,dy,dz,forced,appliedForce);
        }
    }

    activateSpecial(setTo=true) {
        if (this.specialActive && !setTo) {
            gameBoard.sendMessage('Nevermind; cancelled.');
        }
        else if (!this.specialActive && setTo) {
            gameBoard.sendMessage('Step in a direction to fire.');
        }
        this.specialActive=setTo;
        this.updateActions();
    }

    pickUp(endturn=true) {
        const tile = map.getTile(this.position);
        if (tile && tile.item) {
            if (tile.item.name === 'Legendary Hammer of Sixela') {
                gameBoard.sendMessage('You have found the Legendary Hammer of Sixela! You have what you came for, it is time to leave this place!',['good','important']);
                this.winItem=tile.item;
            }
            else {
                gameBoard.sendMessage(`You pick up the ${tile.item.getName(false)}.`,'good');
                if (tile.item.message) {
                    gameBoard.sendMessage(tile.item.message,'good');
                }
            }
            this.inventory.push(map.getItemFromTile(this.position));
            map.revertTile(this.position[0],this.position[1]);
            this.updateInventory();
            if (endturn) {
                this.endTurn();
            }
        }
    }

    canFly() {
        if (this.armor && this.armor.flying) {
            return true;
        }
        else {
            super.canFly();
        }
    }

    updateActions() {
        const tile = map.getTile(this.position);
        this.statsButton.classList.remove('actionExists');
        while(this.actionElement.firstChild) {
            this.actionElement.lastChild.remove();
        }
        if (!this.specialActive) {
            if (this.canAscend()) {
                if (tile.isUpStair()) {
                    gameBoard.sendMessage('You see here a staircase upwards.');
                }
                this.addAction('Ascend.',()=>{
                    this.step(0,0,1);
                    gameBoard.setMenu(false);
                    this.endTurn();
                });
            }
            if (this.canDescend()) {
                if (tile.isDownStair()) {
                    gameBoard.sendMessage('You see here a staircase downwards.');
                }
                this.addAction('Descend.',()=>{
                    this.step(0,0,-1);
                    gameBoard.setMenu(false);
                    this.endTurn();
                });
            }
            if (tile.item) {
                gameBoard.sendMessage(`You see here a ${tile.item.getName(false)}.`);
                this.addAction(`Pick up ${tile.item.getName(false)}.`,()=>{
                    gameBoard.setMenu(false);
                    this.pickUp();
                });
            }
            if (this.wielded && this.wielded.special) {
                this.addAction(this.wielded.special.name,()=>{
                    this.activateSpecial();
                    gameBoard.setMenu(false);
                });
            }
        }
        else {
            this.addAction('Cancel.',()=>{
                this.activateSpecial(false);
                gameBoard.setMenu(false);
            });
        }
    }

    jetpack(fuelFactor=1) {
        if (this.alive && this.canFly()) {
            if(!this.armor.damage(fuelFactor*this.armor.fuelCost)) {
                gameBoard.sendMessage('Your '+this.armor.getName(false)+' runs out of fuel!','bad');
                this.inventory.splice(this.inventory.indexOf(this.armor),1);
                this.armor=null;
            }
            else if (this.armor.getDurabilityFraction()<0.25) {
                gameBoard.sendMessage('Your jetpack is nearly out of fuel!','bad');
            }
            this.updateInventoryElement(this.armor,this.armorElement);
        }
        return this.canFly();
    }

    fall() {
        super.fall(()=>this.jetpack());
    }

    addAction(text,callback) {
        const actionItem = document.createElement('li');
        const actionButton = document.createElement('button');

        actionButton.textContent = text;
        actionButton.addEventListener('click',(event)=>{
            event.preventDefault();
            callback();
        });

        actionItem.appendChild(actionButton);
        this.actionElement.appendChild(actionItem);
        this.statsButton.classList.add('actionExists');
    }

    removeArmor() {
        gameBoard.sendMessage('You take off the '+this.armor.getName(false)+'.');
        this.armor=null;
        this.fall();
        this.updateInventory();
    }

    removeWeapon() {
        gameBoard.sendMessage('You unequip the '+this.wielded.getName(false)+'.');
        this.wielded=null;
        this.updateInventory();
    }

    useItem(index) {
        this.activateSpecial(false);
        const item = this.inventory[index];
        if (item.type === 'armor') {
            gameBoard.sendMessage('You put on the '+item.getName(false)+'.','good');
            this.armor = item;
        }
        else if (item.type === 'tool') {
            gameBoard.sendMessage('You equip the '+item.getName(false)+'.','good');
            this.wielded = item;
        }
        else {
            gameBoard.sendMessage('You '+item.getVerb() +' the '+item.getName(false)+'.','good');
            if ('heal' in item.effect) {
                this.hitpoints += item.effect.heal;
                if (this.hitpoints - item.effect.heal === this.maxHp && item.effect.heal > 15) {
                    if (random.random()>0.5) {
                        this.maxHp++;
                        gameBoard.sendMessage('You feel your vitality permanently increase!','good');
                    }
                }
                if (this.hitpoints > this.maxHp) {
                    this.hitpoints = this.maxHp;
                }
            }
            if ('food' in item.effect) {
                this.healRate = Math.max(1, this.healRate - item.effect.food);
            }
            this.inventory.splice(index,1);
        }
        this.updateInventory();
        this.updateStatus();
        this.updateActions();
    }

    dropItem(index) {
        const item = this.inventory[index];
        if (map.addItem(this.position,item)) {
            gameBoard.sendMessage('You drop the '+item.getName(false)+'.');
            this.inventory.splice(index,1);
            this.updateInventory();
            this.updateActions();
        }
    }

    attack(entity, forced) {
        if (!forced) {
            gameBoard.sendMessage(this.getName() + ' attack ' + entity.getName(false) + '!');
            if (this.wielded) {
                if(!this.wielded.damage(1)) {
                    gameBoard.sendMessage('Your '+this.wielded.getName(false)+' breaks!');
                    this.inventory.splice(this.inventory.indexOf(this.wielded),1);
                    this.wielded=null;
                }
                this.updateInventory();
            }
        }
        else {
            gameBoard.sendMessage(this.getName() + ' collide with ' + entity.getName(false) + '!');
        }
        super.attack(entity,forced);
        return true;
    }
    hurt(dmg) {
        if (this.armor) {
            let protection = this.armor.protect(dmg);
            dmg -= protection;
            if (!this.armor.damage(protection)) {
                gameBoard.sendMessage('Your '+this.armor.getName(false)+' was destroyed!');
                this.inventory.splice(this.inventory.indexOf(this.armor),1);
                this.armor=null;
            }
            this.updateInventory();
        }
        super.hurt(dmg);
        this.updateStatus();
    }
    die() {
        this.setArt('@', 'darkred', 'white');
        this.alive=false;
        this.updateStatus();
    }
    knockBack(direction, tiles) {
        super.knockBack(direction, tiles);
        map.vision(this.position);
    }
    getName(capitalize=true) {
        if (capitalize) {
            return this.name;
        }
        else {
            return this.name.toLowerCase();
        }
    }

    collideMessage(targetTile) {
        gameBoard.sendMessage(this.getName()+' crash into '+targetTile.getName(false)+'!');
    }

    getDamage() {
        if (this.playerTurn && this.wielded) {
            return this.wielded.getDamage();
        }
        else {
            return this.damage;
        }
    }

    getForce() {
        if (this.playerTurn && this.wielded) {
            return this.wielded.getForce();
        }
        else {
            return this.force;
        }
    }

    getMass() {
        if (this.armor) {
            return this.armor.getMass() + this.mass;
        }
        else {
            return this.mass;
        }
    }
}

export default Player;