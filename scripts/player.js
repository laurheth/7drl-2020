import Entity from './entity.js';
import gameBoard from './gameBoard.js';
import map from './map.js';
import actionQueue from './actionQueue.js';
import mapGenerator from './mapGenerator.js';
import getItem from './items.js';
import random from './random.js';

// const player = new entity([15,15],'@');
class Player extends Entity {
    constructor(startPosition) {
        super(startPosition,'@');
        gameBoard.jumpToPosition(startPosition);
        document.addEventListener('keydown',(event)=>this.handleEvent(event));
        map.vision(this.position);
        this.playerTurn=false;
        this.name='You';
        this.nameElement = document.getElementById('name');
        this.nameElement.textContent='Lauren';

        this.hitpoints=20;
        this.maxHp=20;
        this.damage=1;
        this.force=0.1;
        this.mass=2;
        this.healRate=10;

        this.inventory=[];
        this.inventory.push(getItem('bat'));

        this.wielded=this.inventory[0];

        this.visitedLevels=[0];

        this.hpElement = document.getElementById('hp');

        this.inventoryElement = document.getElementById('inventory');
        this.equipedElement = document.getElementById('equiped');
        this.armorElement = document.getElementById('armor');
        this.actionElement = document.getElementById('actions');

        this.armorElement.addEventListener('click',(event)=>{
            event.preventDefault();
            this.removeArmor();
        });

        this.equipedElement.addEventListener('click',(event)=>{
            event.preventDefault();
            this.removeWeapon();
        });

        this.updateStatus();
        this.updateInventory();
    }
    handleEvent(event) {
        // console.log(event);
        if (this.playerTurn && this.alive) {
            let eventCaptured = true;
            let acted=false;
            switch(event.key) {
                case 'ArrowRight':
                    acted=this.step(1,0,0);
                    break;
                case 'ArrowLeft':
                    acted=this.step(-1,0,0);
                    break;
                case 'ArrowUp':
                    acted=this.step(0,-1,0);
                    break;
                case 'ArrowDown':
                    acted=this.step(0,1,0);
                    break;
                case '>':
                    if (map.getTile(this.position) && map.getTile(this.position).isDownStair()) {
                        acted=this.step(0,0,-1);
                    }
                    break;
                case '<':
                    if (map.getTile(this.position) && map.getTile(this.position).isUpStair()) {
                        acted=this.step(0,0,1);
                    }
                    break;
                case '.':
                    acted=true;
                    break;
                case 'g':
                    if(map.getTile(this.position) && map.getTile(this.position).item) {
                        this.inventory.push(map.getItemFromTile(this.position));
                        map.revertTile(this.position[0],this.position[1]);
                        this.updateInventory();
                        acted=true;
                    }
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
        } else {
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
        }
        map.vision(this.position);
        gameBoard.setViewPosition(this.position);
    }
    act() {
        if (this.alive) {
            this.turnCount++;
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
            gameBoard.sendMessage("You die...");
            actionQueue.stop();
        }
        map.vision(this.position);
    }
    updateStatus() {
        this.hpElement.textContent = `${this.hitpoints}/${this.maxHp}`;
    }

    updateInventory() {
        this.armorElement.textContent = (this.armor) ? this.armor.getName() : 'None';
        this.equipedElement.textContent = (this.wielded) ? this.wielded.getName() : 'None';
        while(this.inventoryElement.firstChild) {
            this.inventoryElement.lastChild.remove();
        }
        this.inventory.forEach((item,i)=>{
            if (item !== this.armor && item !== this.wielded) {
                const newElement = document.createElement('li');
                const nameElement = document.createElement('p');
                nameElement.textContent = item.getName();

                const equipButton = document.createElement('button');
                equipButton.addEventListener('click',(event)=>{
                    event.preventDefault();
                    this.useItem(i);
                });
                equipButton.textContent = 'Use item';

                const dropButton = document.createElement('button');
                dropButton.addEventListener('click',(event)=>{
                    event.preventDefault();
                    this.dropItem(i);
                });
                dropButton.textContent = 'Drop item';

                newElement.appendChild(nameElement);
                newElement.appendChild(equipButton);
                newElement.appendChild(dropButton);
                this.inventoryElement.appendChild(newElement);
            }
        });
    }

    updateActions() {
        const tile = map.getTile(this.position);
        while(this.actionElement.firstChild) {
            this.actionElement.lastChild.remove();
        }
        if (tile.isUpStair()) {
            this.addAction('Ascend.',()=>{
                this.step(0,0,1)
                this.endTurn();
            });
        }
        else if (tile.isDownStair()) {
            this.addAction('Descend.',()=>{
                this.step(0,0,-1)
                this.endTurn();
            });
        }
        if (tile.item) {
            this.addAction(`Pick up ${tile.item.getName(false)}.`,()=>{
                this.inventory.push(map.getItemFromTile(this.position));
                map.revertTile(this.position[0],this.position[1]);
                this.updateInventory();
                this.endTurn();
                console.log(this.inventory);
            });
        }
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
    }

    removeArmor() {
        this.armor=null;
        this.updateInventory();
    }

    removeWeapon() {
        this.wielded=null;
        this.updateInventory();
    }

    useItem(index) {
        const item = this.inventory[index];
        if (item.type === 'armor') {
            gameBoard.sendMessage('You put on the '+item.getName(false)+'.');
            this.armor = item;
        }
        else if (item.type === 'tool') {
            gameBoard.sendMessage('You equip the '+item.getName(false)+'.');
            this.wielded = item;
        }
        else {
            console.log(index, item);
            gameBoard.sendMessage('You '+item.getVerb() +' the '+item.getName(false)+'.');
            if ('heal' in item.effect) {
                this.hitpoints += item.effect.heal;
                if (this.hitpoints - item.effect.heal === this.maxHp && item.effect.heal > 15) {
                    if (random.random()>0.5) {
                        this.maxHp++;
                        gameBoard.sendMessage('You feel your vitality permanently increase!');
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
        this.endTurn();
        this.updateInventory();
        this.updateStatus();
    }

    dropItem(index) {
        const item = this.inventory[index];
        if (map.addItem(this.position,item)) {
            this.inventory.splice(index,1);
            this.updateInventory();
            this.updateActions();
        }
    }

    attack(entity, forced) {
        if (!forced) {
            gameBoard.sendMessage(this.getName() + ' attack ' + entity.getName(false) + '!');
            if (this.wielded) {
                console.log(this.wielded);
                if(!this.wielded.damage(1)) {
                    gameBoard.sendMessage('Your '+this.wielded.getName(false)+' breaks!');
                    this.inventory.splice(this.inventory.indexOf(this.wielded),1);
                    this.wielded=null;
                    this.updateInventory();
                }
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
            console.log(dmg, protection,this.armor.getDurability());
            dmg -= protection;
            if (!this.armor.damage(protection)) {
                gameBoard.sendMessage('Your '+this.armor.getName(false)+' was destroyed!');
                this.inventory.splice(this.inventory.indexOf(this.armor),1);
                this.armor=null;
                this.updateInventory();
            }
        }
        super.hurt(dmg);
        this.updateStatus();
    }
    die() {
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