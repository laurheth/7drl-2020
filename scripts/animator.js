import map from './map.js';
import gameBoard from './gameBoard.js';
import actionQueue from './actionQueue.js';

class Animation {
    constructor(interval, character, foreground, background) {
        this.indices = [0,0,0];
        if (!Array.isArray(character)) {
            character = [character];
        }
        if (!Array.isArray(foreground)) {
            foreground = [foreground];
        }
        if (!Array.isArray(background)) {
            background = [background];
        }
        this.interval = interval;
        this.characters = character;
        this.foregrounds = foreground;
        this.backgrounds = background;
        this.frames=[];
        this.toRevert=[];
    }
    addFrame(frame) {
        this.frames.push(frame);
    }
    frame() {
        // Undo the last frame
        if (this.tieToEntity) {
            // console.log('reveal');
            this.tieToEntity.show(true);
        }
        this.toRevert.forEach(position => {
            map.revertTile(...position);
        });

        let frame = this.frames.shift();
        if (!frame) {
            map.display(map.player.position[2]);
            return false;
        }

        if (this.tieToEntity) {
            // console.log('hide');
            this.tieToEntity.hide(true);
        }

        const char = this.characters[this.indices[0]];
        const fore = this.foregrounds[this.indices[1]];
        const back = this.backgrounds[this.indices[2]];

        frame.forEach(position => {
            this.toRevert.push(position);
            gameBoard.setTile(position,char,back,fore);
        });

        // Advance
        this.indices = this.indices.map(x=>x+1);
        this.indices[0] = (this.indices[0] >= this.characters.length) ? 0 : this.indices[0];
        this.indices[1] = (this.indices[1] >= this.foregrounds.length) ? 0 : this.indices[1];
        this.indices[2] = (this.indices[2] >= this.backgrounds.length) ? 0 : this.indices[2];

        return true;
    }
}

const animator = {
    interval: null,
    animations:[],
    act() {
        if (this.interval !== null) {
            clearInterval(this.interval);
        }
        if (this.animations.length > 0) {
            const animation = this.animations.shift();
            this.interval = setInterval(()=>{
                if (!animation.frame()) {
                    animator.act();
                }
            },animation.interval);
        }
        else {
            // No animations, move foreward
            actionQueue.advance();
        }
    },
    newAnimation(interval,characters,foregrounds,backgrounds) {
        this.animations.push(new Animation(interval,characters,foregrounds,backgrounds));
        return this.animations[this.animations.length-1];
    }
};

export default animator;