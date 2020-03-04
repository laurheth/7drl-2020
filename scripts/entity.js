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

        console.log(this.element);

        this.hitpoints = Infinity;
        
        this.setArt(character, background, foreground);
        this.setPosition(position);
        
        this.updateTile(map.getTile(position));

        actionQueue.add(this);
    }

    setArt(character, background, foreground) {
        this.artElement.textContent = character;
        this.artElement.style.color = foreground;
        this.artElement.style.background = background;
    }

    setPosition(position) {
        this.position = position;
        if (position && position.length >= 2) {
            this.element.style.transform = `translate(${position[0]}00%,${position[1]}00%)`;
        }
    }

    step(dx, dy, dz) {
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
            else if (targetTile.isDoor()) {
                map.alternateTile(targetPosition);
                return true;
            }
        }
        return false;
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
        this.element.classList.add('hidden');
    }

    show() {
        this.element.classList.remove('hidden');
    }
}

export default Entity;