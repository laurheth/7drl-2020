import gameBoard from './gameBoard.js';
import map from './map.js';
import actionQueue from './actionQueue.js';

class Entity {
    constructor(position,character, background='#000000', foreground='#FFFFFF') {
        this.element = document.createElement('div');
        this.element.classList.add('entity');;

        this.artElement = document.createElement('div');
        this.artElement.classList.add('art');

        this.element.appendChild(this.artElement);
        gameBoard.gridElement.appendChild(this.element);

        this.alive=true;

        this.hitpoints = Infinity;
        this.damage=1;
        this.mass=1;

        this.turnCount=0;
        
        this.setArt(character, background, foreground);
        this.setPosition(position);
        
        this.updateTile(map.getTile(position));

        actionQueue.add(this);

        this.name='The entity';
        this.pronoun=false;
    }

    setArt(character, background, foreground) {
        if (this.alive) {
            this.artElement.textContent = character;
            this.artElement.style.color = foreground;
            this.artElement.style.background = background;
        }
    }

    setPosition(position) {
        if (this.alive) {
            this.position = position;
            if (position && position.length >= 2) {
                this.element.style.transform = `translate(${position[0]}00%,${position[1]}00%)`;
            }
            // Falling?
            if (map.getTile(this.position) && map.getTile(this.position).isEmpty()) {
                const downPosition = [...this.position];
                downPosition[2]-=1;
                if (map.getTile(this.position) && map.getTile(this.position).isPassable()) {
                    this.hurt(2);
                    this.step(0,0,-1);
                }
            }
        }
    }

    step(dx, dy, dz, forced=false) {
        if (!dx && !dy && !dz) {
            return false;
        }
        const step = [Math.round(dx),Math.round(dy),Math.round(dz)];
        const targetPosition = this.position.map((p,i)=>p+step[i]);
        const targetTile = map.getTile(targetPosition);
        if (targetTile) {
            if (targetTile.isPassable()) {
                this.setPosition(targetPosition);
                this.updateTile(targetTile);
                return true;
            }
            else if (targetTile.entity) {
                return this.attack(targetTile.entity,forced);
            }
            else if (targetTile.isDoor() && !forced) {
                map.alternateTile(targetPosition);
                return true;
            }
            else if (forced) {
                map.damageTile(targetPosition,this.damage);
                this.hurt(this.damage);
            }
        }
        return false;
    }

    knockBack(direction, tiles) {
        for (let i=0;i<tiles;i++) {
            if (this.alive) {
                this.step(direction[0],direction[1],0,true);
            }
        }
    }

    act() {
        actionQueue.advance();
    }

    updateTile(newTile) {
        if (this.currentTile) {
            this.currentTile.entity=null;
        }
        if (newTile) {
            newTile.entity=this;
            if (newTile.isVisible()) {
                this.show();
            }
            else {
                this.hide();
            }
        }
        this.currentTile=newTile;
    }

    hide() {
        if (this.alive) {
            this.element.classList.add('hidden');
        }
    }

    show() {
        if (this.alive) {
            this.element.classList.remove('hidden');
        }
    }

    attack(entity, forced=false) {
        entity.hurt(this.damage);
        return true;
    }

    hurt(dmg) {
        this.hitpoints -= dmg;
        if (this.hitpoints <= 0) {
            this.die();
        }
    }

    die() {
        gameBoard.sendMessage(this.name+" dies!");
        this.alive=false;
        if (this.currentTile) {
            this.currentTile.entity = null;
            this.currentTile=null;
        }
        actionQueue.remove(this);
        this.element.remove();
    }

    getName(capitalize=true) {
        if (capitalize || this.pronoun) {
            return this.name;
        }
        else {
            return this.name.toLowerCase();
        }
    }
}

export default Entity;