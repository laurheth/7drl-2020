class Tile {
    constructor() {
        this.character = ' ';
        this.background = 'black';
        this.foreground = 'white';
        this.passable = true
        this.seen=true;
        this.alternateState = null;
        this.default=true;
        this.exterior=true;
        this.door=false;
    }
    isPassable() {
        return this.passable;
    }
    isDefault() {
        return this.default;
    }
    isDoor() {
        return this.door;
    }
    setProperties(character, background, foreground, passable) {
        this.character = character;
        this.background = background;
        this.foreground = foreground;
        this.passable = passable;
        this.default=false;
        this.exterior=false;
    }
    makeWall() {
        this.setProperties('#','black','white',false);
    }
    makeExterior() {
        this.setProperties('#','white','black',false);
        this.exterior=true;
    }
    makeFloor() {
        this.setProperties('.','black','white',true);
    }
    makeDoor() {
        this.setProperties('+','black','burlywood',false);
        this.alternateState = new Tile();
        this.alternateState.setProperties('-','black','burlywood',true);
        this.alternateState.alternateState = this;
        this.door=true;
    }
    isExterior() {
        return this.exterior;
    }
}

export default Tile;