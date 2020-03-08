// This file is where the actual map interaction takes place
import gameBoard from './gameBoard.js';
import Tile from './tile.js';
import mapGenerator from './mapGenerator.js';

const map = {
    levels: [],
    currentLevel: null,
    levelBelow: null,
    player: null,
    firstDisplay:true,
    addLevel(level) {
        this.levels.push(level);
    },
    prependLevel(level) {
        this.levels.unshift(level);
    },
    display(levelIndex) {
        this.currentLevel = (levelIndex >= 0 && levelIndex < this.levels.length) ? this.levels[levelIndex] : mapGenerator.emptyLevel();

        this.levelBelow = (levelIndex-1 >= 0 && levelIndex-1 < this.levels.length) ? this.levels[levelIndex-1] : mapGenerator.emptyLevel();
        if (this.firstDisplay) {
            this.firstDisplay=false;
            gameBoard.setDimensions([this.currentLevel[0].length, this.currentLevel.length]);
        }
        this.currentLevel.forEach((row,j) => {
            row.forEach((tile,i) => {
                this.updateTile(tile,i,j,levelIndex);
                if (tile.hasBeenSeen()) {
                    gameBoard.setMemory([i,j]);
                }
                else {
                    gameBoard.setAsUnseen([i,j]);
                }
            });
        });
    },
    getTile(position) {
        if (this.onMap(position)) {
            return this.levels[position[2]][position[1]][position[0]];
        }
        return null;
    },
    alternateTile(position) {
        if (this.onMap(position)) {
            this.levels[position[2]][position[1]][position[0]] = this.levels[position[2]][position[1]][position[0]].alternateState;
            this.updateTile(this.levels[position[2]][position[1]][position[0]], position[0], position[1],position[2]);
        }
    },
    onMap(position) {
        if (position.length<3) {return false;}
        if (position[2] >= 0 && position[2] < this.levels.length) {
            if (position[1] >= 0 && position[1] < this.levels[position[2]].length) {
                if (position[0] >= 0 && position[0] < this.levels[position[2]][position[1]].length) {
                    return true;
                }
            }
        }
        return false;
    },
    damageTile(position, dmg,spread=true) {
        const tile = this.getTile(position);
        if (!tile || tile.isEmpty() || (tile.isFloor() && position[2]===0)) {return;}

        // Damage the tile. If it breaks, things get interesting
        const leftOver = tile.hurt(dmg);
        if (leftOver > 0) {
            // Move items
            if (tile.item) {
                this.addItem(position,tile.item);
            }

            if (!isFinite(leftOver)) {leftOver=0;}

            if (!tile.isPassable(true)) {
                tile.makeFloor();
            }
            else if (position[2]>0) {
                if (!tile.isDownStair() && !tile.isUpStair()) {
                    tile.makeEmpty();
                }
            }
            this.updateTile(tile,position[0],position[1],position[2]);
            if (spread) {
                for (let i=-1; i<=1; i++) {
                    for (let j=-1; j<=1; j++) {
                        this.damageTile([position[0]+i, position[1]+j, position[2]],leftOver,false);
                    }
                }
            }
        }
        this.updateTile(tile,...position);
    },
    updateTile(tile,column,row,z) {
        if (z !== gameBoard.currentLevel) {
            return;
        }
        if (this.currentLevel[row][column].isEmpty() && !this.levelBelow[row][column].isEmpty()) {
            gameBoard.setTile([column,row],this.levelBelow[row][column].character,this.levelBelow[row][column].background,this.levelBelow[row][column].foreground,true);
        }
        else {
            if (tile.item) {
                gameBoard.setTile([column,row],tile.item.character,tile.background,tile.item.color);
            }
            else {
                gameBoard.setTile([column,row],tile.character,tile.background,tile.foreground);
            }
        }
    },
    getItemFromTile(position) {
        const tile = this.getTile(position);
        if (tile) {
            const item = tile.getItem();
            if (item) {
                tile.setItem(null);
                return item;
            }
        }
        return null;
    },
    addItem(position, item) {
        let searchDistance=0;
        while (searchDistance < 50) {
            for (let i=-searchDistance; i<=searchDistance; i++) {
                for (let j=-searchDistance; j<=searchDistance; j++) {
                    const tile = this.getTile([position[0]+i,position[1]+j,position[2]]);
                    if (tile && !tile.item && tile.isFloor()) {
                        tile.setItem(item);
                        this.revertTile(position[0]+i,position[1]+j);
                        return true;
                    }
                    else if (tile && tile.isEmpty() && position[2]>0) {
                        return this.addItem([position[0],position[1],position[2]-1]);
                    }
                }
            }
            searchDistance++;
        }
        return false;
    },
    revertTile(column, row) {
        let z=gameBoard.currentLevel;
        if (this.getTile([column, row, z])) {
            this.updateTile(this.getTile([column, row, z]),column, row, z);
        }
    },
    clearVision(startPosition,range=9) {
        // console.log('vision', startPosition);
        const minCorner = startPosition.map((x,i)=>(i!==2) ? x-range : x);
        const maxCorner = startPosition.map((x,i)=>(i!==2) ? x+range : x);
        // Unsee old tiles
        for (let i=minCorner[0];i<=maxCorner[0];i++) {
            for (let j=minCorner[1];j<=maxCorner[1];j++) {
                gameBoard.unseeTile([i,j]);
                const thisTile = this.getTile([i,j,startPosition[2]]);
                if (thisTile) {
                    thisTile.unsee();
                }
            }   
        }
    },
    vision(startPosition,range=8) {
        const minCorner = startPosition.map((x,i)=>(i!==2) ? x-range : x);
        const maxCorner = startPosition.map((x,i)=>(i!==2) ? x+range : x);
        // Always see the start tile
        if (this.getTile(startPosition)) {
            this.getTile(startPosition).see();
            gameBoard.seeTile(startPosition);
        }

        const seen=[];

        const rayCast = (start,end,range)=> {
            if (Math.pow(end[0]-start[0],2) + Math.pow(end[1]-start[1],2) > range**2) {
                return;
            }
            const current = [...start];
            const distance = Math.sqrt(Math.pow(start[0] - end[0],2) + Math.pow(start[1] - end[1],2));
            const direction = [(end[0] - start[0]) / distance, (end[1] - start[1])/distance];
            // console.log('direction', direction);
            let breaker=0;
            while (Math.sqrt(Math.pow(start[0] - current[0],2) + Math.pow(start[1] - current[1],2)) < distance && breaker < 20) {
                breaker++;
                current[0] += direction[0];
                current[1] += direction[1];
                const thisTile = this.getTile(current.map(x=>Math.round(x)));
                // DOM manipulation is expensive; minimize it where possible
                if (thisTile && (seen.indexOf(thisTile)<0)) {
                    thisTile.see();
                    gameBoard.seeTile(current.map(x=>Math.round(x)));
                    map.revertTile(current.map(x=>Math.round(x)));
                }
                if (!thisTile || !thisTile.isSeeThrough()) {
                    return;
                }
            }
        };

        // See new tiles
        for (let i=minCorner[0];i<=maxCorner[0];i++) {
            for (let j=minCorner[1];j<=maxCorner[1];j++) {
                rayCast(startPosition, [i,j,startPosition[2]],range);
            }   
        }

        const postProcess = (thisTile, i, j, k) => {
            for (let ii=-1; ii<2; ii++) {
                for (let jj=-1; jj<2; jj++) {
                    const testTile = this.getTile([i+ii,j+jj,k]);
                    if (testTile && testTile.isSeeThrough() && testTile.isVisible()) {
                        thisTile.see();
                        gameBoard.seeTile([i,j,k]);
                        return;
                    }
                }
            }
        }

        // Post-processing, make artefacts visible
        for (let i=minCorner[0];i<=maxCorner[0];i++) {
            for (let j=minCorner[1];j<=maxCorner[1];j++) {
                const thisTile = this.getTile([i,j,startPosition[2]]);
                if (thisTile && !thisTile.isSeeThrough() && !thisTile.isVisible()) {
                    postProcess(thisTile,i,j,startPosition[2]);
                }
            }   
        }
    }
};

export default map;