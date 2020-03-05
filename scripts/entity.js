import gameBoard from './gameBoard.js';
import map from './map.js';
import actionQueue from './actionQueue.js';
// import Doodad from './doodad.js';

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
        this.force=1;
        this.mass=1;
        this.blastRadius=0;
        this.explosive=false;
        this.noDirectDamage=false;

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
                if (map.getTile([downPosition[0],downPosition[1],downPosition[2]-1]) && map.getTile([downPosition[0],downPosition[1],downPosition[2]-1]).isPassable(true)) {
                    let fallDistance=0;
                    while(map.getTile(downPosition) && map.getTile(downPosition).isEmpty()) {
                        downPosition[2]-=1;
                        fallDistance++;
                    }
                    if (map.getTile(downPosition)) {
                        if (map.getTile(downPosition).isPassable()) {
                            this.hurt(Math.max(0,2*(fallDistance-1)));
                        }
                        else if (map.getTile(downPosition).entity) {
                            gameBoard.sendMessage('Splat! Death from above!');
                            map.getTile(downPosition).entity.die();
                        }
                    }
                    else {
                        downPosition[2]+=1;
                        fallDistance--;
                        this.hurt(Math.max(0,this.mass*(fallDistance-1)));
                    }
                    if (this === map.player) {
                        gameBoard.sendMessage('You fall down '+fallDistance+' floors...');
                    }
                    else if (map.getTile(position) && map.getTile(position).isVisible()) {
                        gameBoard.sendMessage(this.getName()+' falls down!');
                    }
                    else if (map.getTile(downPosition).isVisible()) {
                        gameBoard.sendMessage(this.getName()+' falls from above and lands nearby!');
                    }
                    this.position=downPosition;
                }
            }
            this.updateTile(map.getTile(this.position));
        }
    }

    step(dx, dy, dz, forced=false,appliedForce=0) {
        if (!dx && !dy && !dz) {
            return false;
        }
        const step = [Math.round(dx),Math.round(dy),Math.round(dz)];
        const targetPosition = this.position.map((p,i)=>p+step[i]);
        const targetTile = map.getTile(targetPosition);
        if (targetTile) {
            if (targetTile.isPassable()) {
                this.setPosition(targetPosition);
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
                if (targetTile.isVisible()) {
                    this.collideMessage(targetTile);
                }
                map.damageTile(targetPosition,appliedForce);
                this.hurt(appliedForce);
            }
        }
        return false;
    }

    push(target, travel=true) {
        const targPos = [...target.position];
        const direction = [Math.sign(targPos[0] - this.position[0]), Math.sign(targPos[1] - this.position[1])];
        let pushDist = Math.ceil(this.force / target.mass);
        // If can't attack it, must push, don't just sit there
        if(target.noDirectDamage) {
            pushDist = Math.max(1,pushDist);
        }
        target.knockBack(direction,pushDist);
        if (travel && map.getTile(targPos).isPassable()) {
            this.step(direction[0],direction[1],0);
        }
    }

    knockBack(direction, tiles) {
        for (let i=0;i<tiles;i++) {
            if (this.alive) {
                this.step(direction[0],direction[1],0,true,Math.ceil(this.mass));
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

    attack(entity, forced=false, silent=false) {
        // Don't directly attack doodads, but do shove them, unless forced to
        if (!entity.noDirectDamage || forced) {
            entity.hurt(this.damage);
        }
        if (forced) {
            this.hurt(entity.damage);
        }
        this.push(entity);
        return true;
    }

    hurt(dmg) {
        this.hitpoints -= Math.ceil(dmg);
        if (this.hitpoints <= 0) {
            this.die();
        }
    }

    die() {
        this.alive=false;
        if (this.currentTile) {
            if (this.currentTile.isVisible()) {
                if (!this.explosive) {
                    gameBoard.sendMessage(this.getName()+" dies!");
                }
                else {
                    gameBoard.sendMessage(this.getName()+" explodes!");
                }
            }
            this.currentTile.entity = null;
            this.currentTile=null;
        }
        if (this.explosive) {
            this.detonate();
        }
        actionQueue.remove(this);
        this.element.remove();
    }

    getName(capitalize=true) {
        if (this.pronoun) {
            return this.name;
        }
        else {
            if (capitalize) {
                return 'The '+this.name;
            }
            else {
                return 'the '+this.name;
            }
        }
    }
    collideMessage(targetTile) {
        gameBoard.sendMessage(this.getName()+' crashes into '+targetTile.getName(false)+'.');
    }
    // Kablooie!
    detonate() {
        let distance=0;
        let annulus=0;
        let i,j;
        let damageToDeal;
        let forceToPush;
        let pushEntities=false;
        let damageTiles=false;
        // I want damage to be applied centrally, and move outwards, so do it via and expanding annulus
        annulus=0;
        while (annulus <= this.blastRadius+1) {
            for (i=-annulus-1;i<=annulus+1;i++) {
                for (j=-annulus-1;j<=annulus+1;j++) {
                    pushEntities=false;
                    damageTiles=false;
                    if (Math.abs(i) !== annulus+1 && Math.abs(j) !== annulus+1) {
                        pushEntities=true;
                    }
                    else if (Math.abs(i) !== annulus && Math.abs(j) !== annulus) {
                        damageTiles=true;
                    }
                    else {
                        continue;
                    }
                    distance = Math.sqrt(i*i + j*j);
                    if (distance>this.blastRadius) {
                        continue;
                    }
                    else {
                        damageToDeal = Math.max(1,this.damage * (this.blastRadius - distance) / this.blastRadius);
                        forceToPush = Math.max(1,this.force * (this.blastRadius - distance) / this.blastRadius);
                        const tile = map.getTile([this.position[0]+i, this.position[1]+j, this.position[2]]);
                        if (tile) {
                            if (pushEntities) {
                                if (tile.entity) {
                                    tile.entity.hurt(damageToDeal);
                                    if (tile.entity) {
                                        tile.entity.knockBack([Math.sign(i),Math.sign(j)],forceToPush);
                                    }
                                }
                            }
                            else {
                                map.damageTile([this.position[0]+i, this.position[1]+j, this.position[2]],damageToDeal + forceToPush);
                            }
                        }
                    }
                }
            }
            annulus++;
        }
    }
}

export default Entity;