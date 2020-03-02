// This file is where the actual map interaction takes place
import gameBoard from './gameBoard.js';

class tile {
    constructor(character, background, foreground, passable) {
        this.character = character;
        this.background = background;
        this.foreground = foreground;
        this.passable = passable;
    }
    isPassable() {
        return this.passable;
    }
}

const map = {
    
};

export default map;