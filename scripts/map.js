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
    }
};

export default map;