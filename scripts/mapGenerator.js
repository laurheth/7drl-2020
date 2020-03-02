import gameBoard from './gameBoard.js';
import map from './map.js';
import Tile from './tile.js';

const mapGenerator = {
    dimensions: [50,50],
    // Run the generator, given some dimensions
    generate() {
        gameBoard.setDimensions(this.dimensions);
        for (let z=0;z<this.dimensions[0]/3-2;z++) {
            const level=this.emptyLevel();
            for (let i=3*z;i<(this.dimensions[0] - 3*z);i++) {
                for (let j=3*z;j<(this.dimensions[1] - 3*z);j++) {
                    if (i===3*z || j===3*z || i===(this.dimensions[0]-1-3*z) || j===(this.dimensions[1]-1-3*z)) {
                        level[j][i].character = '#';
                    }
                    else {
                        level[j][i].character = '.';
                    }
                }
            }
            map.addLevel(level);
        }
    },

    // Generate an empty level
    emptyLevel() {
        const level = [];
        for (let i=0;i<this.dimensions[1];i++) {
            const row=[];
            for (let j=0;j<this.dimensions[0];j++) {
                row.push(new Tile());
            }
            level.push(row);
        }
        return level;
    }
}

export default mapGenerator;