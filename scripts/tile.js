class Tile {
    constructor() {
        this.character = ' ';
        this.background = 'black';
        this.foreground = 'white';
        this.passable = true
        this.seen=true;
    }
    isPassable() {
        return this.passable;
    }
    setProperties(character, background, foreground, passable) {
        this.character = character;
        this.background = background;
        this.foreground = foreground;
        this.passable = passable;
    }
    makeWall() {
        this.setProperties('#','black','white',false);
    }
    makeFloor() {
        this.setProperties('.','black','white',true);
    }
}

export default Tile;