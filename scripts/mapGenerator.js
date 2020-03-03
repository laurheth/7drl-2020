import gameBoard from './gameBoard.js';
import map from './map.js';
import Tile from './tile.js';
import random from './random.js';

const mapGenerator = {
    dimensions: [50,50],
    border: 3, // stay this far away from the map edge
    towerHeight: 26, // traditional roguelike depth
    // Run the generator, given some dimensions
    generate() {
        // Allocate a giant, empty map
        const fullMap=[];
        for (let z=0;z<this.towerHeight;z++) {
            fullMap.push(this.emptyLevel());
        }
        this.tower(fullMap,this.towerHeight-1,0.9);
        let bonusTowers = random.range(3,10);
        for (let i=bonusTowers-1;i>=0;i--) {
            let z = Math.floor((1+i) * this.towerHeight / bonusTowers);
            this.tower(fullMap,z,random.random());
        }
        map.levels=fullMap;
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
    },

    // Tower
    // Start with a rectangle at the top
    // Descend, and as you descend, get bigger periodically
    tower(fullLevel, startZ, growProb=0.5) {
        // Start at top and go down
        const startSize = random.range(5,7);
        let minCorner = this.forceInBorder(this.randomPosition(),startSize).map((x)=>x-startSize);
        let maxCorner = this.forceInBorder(minCorner.map((x)=>x+startSize));

        for (let z=startZ-1; z>=0; z--) {
            this.rectangle(fullLevel[z],[minCorner[0], maxCorner[0]],[minCorner[1],maxCorner[1]],random.range(10,100));
            if (random.random()<growProb) {
                if (random.random()>0.5) {
                    minCorner = this.forceInBorder(minCorner.map(x=>x-1));
                }
                else {
                    maxCorner = this.forceInBorder(maxCorner.map(x=>x+1));
                }
            }
        }
    },

    // Rectangle
    // Generate a rectangular area, with some chance of subdividing
    rectangle(level, columns, rows, subdivisionSize=5000) {
        for (let i=columns[0];i<=columns[1];i++) {
            for (let j=rows[0];j<=rows[1];j++) {
                if (level[j][i].numberOfChanges()===0) {
                    if (i===columns[0] || i===columns[1] || j===rows[0] || j===rows[1]) {
                        level[j][i].makeWall();
                    }
                    else {
                        level[j][i].makeFloor();
                    }
                }
            }
        }
        const subdivisions = Math.floor(((columns[1]-columns[0]) * (rows[1] - rows[0])) / subdivisionSize);
        if (subdivisions > 0) {
            for (let i=0;i<subdivisions;i++) {
                this.subdivide(level,random.range(columns[0]+3, columns[1]-3), random.range(rows[0]+3, rows[1]-3))
            }
        }
    },

    // Force to be within the desired border
    forceInBorder(position, padding=0) {
        console.log(position);
        const border = this.border + padding;
        return position.map((x,i)=>{
            if (x < border) {
                return border;
            }
            else if (x + border >= this.dimensions[i]) {
                return this.dimensions[i]-border;
            }
            else {
                return x;
            }
        });
    },

    randomPosition() {
        return [random.range(0,this.dimensions[0]), random.range(0,this.dimensions[1])];
    },

    subdivide(level, column, row) {
        const direction=[0,0];
        // Define a direction, and also, offset them so that walls wont intersect doors
        if (random.random()>0.5) {
            direction[0]=1;
            column = 2*Math.floor(column/2);
            row = 2*Math.floor(row/2);
        }
        else {
            direction[1]=1;
            column = 2*Math.floor(column/2)+1;
            row = 2*Math.floor(row/2)+1;
        }
        if (level[row][column].isPassable() && level[row][column].numberOfChanges()<=1) {
            level[row][column].makeDoor();
            for (let i=-1;i<2;i+=2) {
                const position = [column + i * direction[0], row + i * direction[1]];
                while (this.withinMap(position) && level[position[1]][position[0]].isPassable()) {
                    level[position[1]][position[0]].makeWall();
                    position[0] += i * direction[0];
                    position[1] += i * direction[1];
                }
            }
        }
    },

    withinMap(position) {
        return position[0]>=0 && position[0]<this.dimensions[0] && position[1] >= 0 && position[1] < this.dimensions[1];
    }
}

export default mapGenerator;