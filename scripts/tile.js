class Tile {
    constructor() {
        this.character = ' ';
        this.background = 'black';
        this.foreground = 'white';
        this.passable = true
        this.seen=true;
        this.alternateState = null;
        this.changes=0;
    }
    isPassable() {
        return this.passable;
    }
    numberOfChanges() {
        return this.changes;
    }
    setProperties(character, background, foreground, passable) {
        this.character = character;
        this.background = background;
        this.foreground = foreground;
        this.passable = passable;
        this.changes++;
    }
    makeWall() {
        this.setProperties('#','black','white',false);
    }
    makeFloor() {
        this.setProperties('.','black','white',true);
    }
    makeDoor() {
        this.setProperties('+','black','burlywood',false);
        this.alternateState = new Tile();
        this.alternateState.setProperties('-','black','burlywood',true);
        this.alternateState.alternateState = this;
    }
}

export default Tile;