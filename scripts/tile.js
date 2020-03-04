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
        this.entity=null;
        this.hitpoints=Infinity;
    }
    isPassable(ignoreEntities=false) {
        if (this.entity && !ignoreEntities) {
            return false;
        }
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
            this.hitpoints=10;
            this.setProperties('#','lightgray','gray',false, false);
        }
    }
    makeEmpty() {
        this.hitPoints=Infinity;
        this.setProperties(' ','black','white',true);
    }
    makeExterior() {
        if (!this.noOverwrite) {
            this.makeWall();
            this.exterior=true;
        }
    }
    makeFloor(preserveFloor=false) {
        this.setProperties('.','black','white',true);
        this.noOverwrite = preserveFloor;
        this.hitpoints=5;
    }
    makeGrass() {
        this.setProperties('.','black','lightgreen',true);
    }
    makeDoor() {
        this.setProperties('+','brown','white',false, false);
        this.alternateState = new Tile();
        this.alternateState.setProperties('-','black','brown',true);
        this.alternateState.alternateState = this;
        this.door=true;
        this.hitpoints=1;
    }
    isExterior() {
        return this.exterior;
    }
    makeStairs(up=true) {
        if (!this.noOverwrite) {
            this.hitPoints = Infinity;
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
        if (this.entity) {
            this.entity.show();
        }
    }
    unsee() {
        this.visible=false;
        if (this.entity) {
            this.entity.hide();
        }
    }
    // Figure this out later
    hurt(dmg) {
        this.hitpoints -= dmg;
        if (this.hitpoints < 0) {
            return Math.max(1,Math.abs(this.hitpoints));
        }
        return 0;
    }
    isEmpty() {
        return (this.isPassable() && this.character === ' ');
    }
}

export default Tile;