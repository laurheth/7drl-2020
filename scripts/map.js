// This file is where the actual map interaction takes place
import gameBoard from './gameBoard.js';
import Tile from './tile.js';
import mapGenerator from './mapGenerator.js';

const map = {
    levels: [],
    addLevel(level) {
        this.levels.push(level);
    },
    prependLevel(level) {
        this.levels.unshift(level);
    },
    display(levelIndex) {
        const level = (levelIndex >= 0 && levelIndex < this.levels.length) ? this.levels[levelIndex] : mapGenerator.emptyLevel();
        const levelBelow = (levelIndex-1 >= 0 && levelIndex-1 < this.levels.length) ? this.levels[levelIndex-1] : mapGenerator.emptyLevel();
        gameBoard.setDimensions([level[0].length, level.length]);
        level.forEach((row,j) => {
            row.forEach((tile,i) => {
                if (level[j][i].isDefault() && !levelBelow[j][i].isDefault()) {
                    gameBoard.setTile([i,j],levelBelow[j][i].character,levelBelow[j][i].background,levelBelow[j][i].foreground,true);
                }
                else {
                    gameBoard.setTile([i,j],tile.character,tile.background,tile.foreground);
                }
                gameBoard.seeTile([i,j]);
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
            console.log(this.levels[position[2]][position[1]][position[0]]);
            console.log(this.levels[position[2]][position[1]][position[0]].alternateState)
            this.levels[position[2]][position[1]][position[0]] = this.levels[position[2]][position[1]][position[0]].alternateState;
            this.updateTile(this.levels[position[2]][position[1]][position[0]], position[0], position[1]);
        }
    },
    onMap(position) {
        if (position[2] >= 0 && position[2] < this.levels.length) {
            if (position[1] >= 0 && position[1] < this.levels[position[2]].length) {
                if (position[0] >= 0 && position[0] < this.levels[position[2]][position[1]].length) {
                    return true;
                }
            }
        }
        return false;
    },
    updateTile(tile,column,row) {
        gameBoard.setTile([column,row],tile.character,tile.background,tile.foreground);
    }
};

export default map;