import gameBoard from './gameBoard.js';
import map from './map.js';
import Tile from './tile.js';
import random from './random.js';
import roomBuilder from './roomBuilder.js';

const mapGenerator = {
    dimensions: [50,50],
    border: 3, // stay this far away from the map edge
    towerHeight: 26, // traditional roguelike depth
    numberOfTiles: 0,
    targetTiles: 15000,
    // Run the generator, given some dimensions
    generate() {
        // Allocate a giant, empty map
        const fullMap=[];
        for (let z=0;z<this.towerHeight;z++) {
            fullMap.push(this.emptyLevel());
        }
        // Build the shell of the structure
        this.buildExterior(fullMap);

        // Add some fancier rooms on top of the existing labyrinthe
        this.addFancyRooms(fullMap);

        // Add some cool hallways
        this.addHallways(fullMap);

        // Add a pile of subdivisions
        this.subdivideEverything(fullMap);


        // Todo
        // touchups, add floors above things a floor down
        
        // Store the generated map
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

    // Build exterior. Maxes a shell of a map by placing a bunch of towers and mashing them together
    buildExterior(fullMap) {
        this.tower(fullMap,this.towerHeight-1,0.9);
        while (this.numberOfTiles < this.targetTiles) {
            this.tower(fullMap,random.range(0,this.towerHeight-1),random.random());
        }
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
    // Generate a rectangular section of the tower
    rectangle(level, columns, rows, subdivisionSize=5000) {
        for (let i=columns[0];i<=columns[1];i++) {
            for (let j=rows[0];j<=rows[1];j++) {
                if (i===columns[0] || i===columns[1] || j===rows[0] || j===rows[1]) {
                    if (level[j][i].isExterior()) {
                        level[j][i].makeExterior();
                    }
                    else {
                        level[j][i].makeFloor();
                    }
                }
                else {
                    if (level[j][i].isDefault()) {
                        this.numberOfTiles++;
                    }
                    level[j][i].makeFloor();
                }
            }
        }
    },

    // Force to be within the desired border
    forceInBorder(position, padding=0) {
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

    subdivideEverything(fullMap) {
        const floorNum = (this.dimensions[0]-2*this.border) * (this.dimensions[1]-2*this.border);
        for (let z=0; z<this.towerHeight; z++) {
            let subdivisions = Math.floor(floorNum / random.range(10,100));
            for (let i=0; i<subdivisions;i++) {
                const position = this.forceInBorder(this.randomPosition());
                if (!fullMap[z][position[1]][position[0]].isExterior()) {
                    this.subdivide(fullMap[z],position[0],position[1]);
                }
            }
        }
    },

    subdivide(level, column, row) {
        const direction=[0,0];
        // Choose a direction
        if (random.random()>0.5) {
            direction[0]=1;
        }
        else {
            direction[1]=1;
        }
        let isValid=true;
        // First, check if valid. The check is: all spaces around the start open?
        const testPosition=[column, row];
        for (let i=-1;i<2;i++) {
            for (let j=-1; j<2; j++) {
                isValid &= this.withinMap([testPosition[0]+i, testPosition[1]+j]);
                if (isValid) {
                    isValid &= level[testPosition[1]+j][testPosition[0]+i].isPassable() && !level[testPosition[1]+j][testPosition[0]+i].isExterior();
                }
            }
        }
        if (!isValid) {
            return;
        }
        // Second check is: would the wall block any doors?
        for (let i=-1;i<2;i+=2) {
            const position = [column + i * direction[0], row + i * direction[1]];
            while (this.withinMap(position) && level[position[1]][position[0]].isPassable()) {
                for (let dx=-1;dx<2;dx++) {
                    for (let dy=-1;dy<2;dy++) {
                        isValid &= !level[position[1]+dy][position[0]+dx].isDoor();
                    }
                }
                position[0] += i * direction[0];
                position[1] += i * direction[1];
            }
        }
        if (!isValid) {
            return;
        }
        // Everything checks out. Add the subdivision!
        level[row][column].makeDoor();
        for (let i=-1;i<2;i+=2) {
            const position = [column + i * direction[0], row + i * direction[1]];
            while (this.withinMap(position) && level[position[1]][position[0]].isPassable()) {
                level[position[1]][position[0]].makeWall();
                position[0] += i * direction[0];
                position[1] += i * direction[1];
            }
        }
    },

    withinMap(position) {
        return position[0]>=0 && position[0]<this.dimensions[0] && position[1] >= 0 && position[1] < this.dimensions[1];
    },

    addFancyRooms(fullMap) {
        for (let z=0; z<this.towerHeight; z++) {
            for (let i=0; i<5;i++) {
                const roomSize = [random.range(7,15), random.range(7,15)];
                let minCorner = this.forceInBorder(this.randomPosition(),Math.max(...roomSize)).map((x)=>x-Math.max(...roomSize));
                let maxCorner = this.forceInBorder(minCorner.map((x,i)=>x+roomSize[i]));
                roomBuilder.rectangle(fullMap[z],minCorner,maxCorner);
            }
        }
    },

    // Originally intended as hallways but honestly closer to bridges
    addHallways(fullMap) {
        for (let z=0; z<this.towerHeight; z++) {
            let hallways=3;
            let breaker=0;
            while (breaker < 10 && hallways>0) {
                breaker++;
                let start = this.forceInBorder(this.randomPosition(),3);
                let end = this.forceInBorder(this.randomPosition(),3);
                if (roomBuilder.hallWay(fullMap[z],start,end)) {
                    hallways--;
                }
            }
        }
    }
}

export default mapGenerator;