class Tile {
    constructor() {
        this.character = ' ';
        this.background = 'black';
        this.foreground = 'white';
        this.passable = true
        this.alternateState = null;
        this.default=true;
        this.exterior=true;
        this.door=false;
        this.noOverwrite=false;
        this.id=-1;
        this.seeThrough=true;
        this.visible=false;
        this.seen=false;
    }
    isPassable() {
        return this.passable;
    }
    isSeeThrough() {
        return this.seeThrough;
    }
    isDefault() {
        return this.default;
    }
    isDoor() {
        return this.door;
    }
    setProperties(character, background, foreground, passable, seeThrough=true) {
        this.character = character;
        this.background = background;
        this.foreground = foreground;
        this.passable = passable;
        this.seeThrough = seeThrough
        this.default=false;
        this.exterior=false;
    }
    makeWall() {
        if (!this.noOverwrite) {
            this.setProperties('#','black','white',false, false);
        }
    }
    makeExterior() {
        if (!this.noOverwrite) {
            this.setProperties('#','white','black',false, false);
            this.exterior=true;
        }
    }
    makeFloor(preserveFloor=false) {
        this.setProperties('.','black','white',true);
        this.noOverwrite = preserveFloor;
    }
    makeDoor() {
        this.setProperties('+','black','burlywood',false, false);
        this.alternateState = new Tile();
        this.alternateState.setProperties('-','black','burlywood',true);
        this.alternateState.alternateState = this;
        this.door=true;
    }
    isExterior() {
        return this.exterior;
    }
    makeStairs(up=true) {
        if (!this.noOverwrite) {
            if (up) {
                this.setProperties('<','black','white',true);
            }
            else {
                this.setProperties('>','black','white',true);
            }
            this.noOverwrite = true
            return true;
        }
        return false;
    }
    canOverwrite() {
        return !this.noOverwrite;
    }
    // Sets the id for which tower this belows to
    setTowerId(id){
        this.id=id;
    }
    isUpStair() {
        return (this.character === '<');
    }
    isDownStair() {
        return (this.character === '>');
    }
    isVisible() {
        return this.visible;
    }
    hasBeenSeen() {
        return this.seen;
    }
    see() {
        this.visible=true;
        this.seen=true;
    }
    unsee() {
        this.visible=false;
    }
}

export default Tile;