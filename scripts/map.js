// This file is where the actual map interaction takes place
import gameBoard from './gameBoard.js';
import Tile from './tile.js';

const map = {
    levels: [],
    addLevel(level) {
        this.levels.push(level);
    },
    display(levelIndex) {
        const level = this.levels[levelIndex];
        level.forEach((row,j) => {
            row.forEach((tile,i) => {
                gameBoard.setTile([i,j],tile.character);
                gameBoard.seeTile([i,j]);
            });
        });
    }
};

export default map;