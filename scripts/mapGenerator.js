// import gameBoard from './gameBoard.js';
import map from './map.js';
import Tile from './tile.js';
import random from './random.js';
import roomBuilder from './roomBuilder.js';
import Monster from './monsters.js';
import Doodad from './doodad.js';
import getItem from './items.js';

const mapGenerator = {
    dimensions: [50,50],
    border: 6, // stay this far away from the map edge
    towerHeight: 26, // traditional roguelike depth
    numberOfTiles: 0,
    targetFraction: 0.5, // Fraction of the entire map to fill with towers
    targetTiles: 15000,
    towerNumber: -1,
    possibleStairs: [],
    connectedTowers: [],
    // Run the generator, given some dimensions
    generate() {
        // Allocate a giant, empty map
        const fullMap=[];
        for (let z=0;z<this.towerHeight;z++) {
            fullMap.push(this.emptyLevel());
            this.possibleStairs.push({});
            this.connectedTowers.push({});
        }
        // Do the math on the target number of tiles
        this.targetTiles = this.targetFraction * (this.dimensions[0] - this.border*2) * (this.dimensions[1] - this.border*2) * this.towerHeight;

        // Build the shell of the structure
        this.buildExterior(fullMap);

        // Add a front door in front of where the player will be
        this.addFrontDoor(fullMap[0]);

        // Add some fancier rooms to the space while it is still mostly empty
        this.addFancyRooms(fullMap);

        // Add some cool hallways
        this.addHallways(fullMap);

        // Add a pile of subdivisions
        this.subdivideEverything(fullMap);


        // Add stairs and doors!
        this.addConnections(fullMap);

        
        // touchups, add floors above things a floor down
        this.postProcessing(fullMap);

        // Store the generated map
        map.levels=fullMap;

        this.populateLevel(map.levels[0],0);
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
        this.towerNumber++;
        const connectedTowers=[this.towerNumber];
        // Start at top and go down
        const startSize = random.range(5,7);
        let minCorner = this.forceInBorder(this.randomPosition(),startSize).map((x)=>x-startSize);
        let maxCorner = this.forceInBorder(minCorner.map((x)=>x+startSize));

        for (let z=startZ-1; z>=0; z--) {
            this.rectangle(fullLevel[z],[minCorner[0], maxCorner[0]],[minCorner[1],maxCorner[1]],connectedTowers,random.range(10,100));
            this.possibleStairs[z][this.towerNumber]=[];

            if (this.towerNumber !== Math.min(...connectedTowers)) {
                while (Math.min(...connectedTowers) in this.connectedTowers[z] && Math.min(...connectedTowers) !== this.connectedTowers[z][Math.min(...connectedTowers)]) {
                    connectedTowers.push(this.connectedTowers[z][Math.min(...connectedTowers)]);
                }
            }
            for (let i=0;i<connectedTowers.length;i++) {
                this.connectedTowers[z][connectedTowers[i]] = Math.min(...connectedTowers);
            }

            this.possibleStairs[z][this.towerNumber].push([minCorner, maxCorner]);


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
    rectangle(level, columns, rows, connectedTowers, subdivisionSize=5000) {
        for (let i=columns[0];i<=columns[1];i++) {
            for (let j=rows[0];j<=rows[1];j++) {
                if (level[j][i].id >= 0 && level[j][i].id !== this.towerNumber && connectedTowers.indexOf(level[j][i].id)<0) {
                    connectedTowers.push(level[j][i].id);
                }
                if (i===columns[0] || i===columns[1] || j===rows[0] || j===rows[1]) {
                    if (level[j][i].isExterior()) {
                        level[j][i].makeExterior();
                    }
                    else {
                        level[j][i].makeFloor();
                        level[j][i].setTowerId(this.towerNumber);
                    }
                }
                else {
                    if (level[j][i].isDefault()) {
                        this.numberOfTiles++;
                    }
                    level[j][i].makeFloor();
                    level[j][i].setTowerId(this.towerNumber);
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
                return this.dimensions[i]-border-1;
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
            let subdivisions = Math.floor(floorNum / random.range(10,50));
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
        // Second check is: would the wall block any doors, or pass too close to any walls?
        for (let i=-1;i<2;i+=2) {
            const position = [column + i * direction[0], row + i * direction[1]];
            while (this.withinMap(position) && level[position[1]][position[0]].isPassable()) {
                for (let dx=-1;dx<2;dx++) {
                    for (let dy=-1;dy<2;dy++) {
                        isValid &= !level[position[1]+dy][position[0]+dx].isDoor();
                        if ((direction[0]===0 && dx !==0 && dy===0) || (direction[1]===0 && dy !==0 && dx===0)) {
                            isValid &= level[position[1]+dy][position[0]+dx].isPassable();
                        }
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
            for (let i=0; i<10;i++) {

                if (Object.keys(this.possibleStairs[z]).length >0) {
                    const towerArea = this.possibleStairs[z][random.selection(Object.keys(this.possibleStairs[z]))][0];

                    const size = [towerArea[1][0] - towerArea[0][0], towerArea[1][1] - towerArea[0][1]];

                    const roomSize = [random.range(5,Math.min(15,size[0]-4)), random.range(5,Math.min(15,size[1]-4))];

                    const minCorner = towerArea[0].map((x,i)=>x + random.range(2,size[i]-roomSize[i]-2));
                    const maxCorner = this.forceInBorder(minCorner.map((x,i)=>x+roomSize[i]));

                    if (random.random()>0.6) {
                        roomBuilder.rectangle(fullMap[z],minCorner,maxCorner);
                    }
                    else {
                        roomBuilder.shapedRoom(fullMap[z],minCorner,maxCorner);
                    }
                }
            }
        }
    },

    // Originally intended as hallways but honestly closer to bridges
    // Currently turned off until a better algorithm is written for it
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
    },

    addConnections(fullMap) {
        // Resolve connections
        const connections=[];
        for (let z=0;z<this.connectedTowers.length;z++) {
            const connectionObj={};
            const keys=Object.keys(this.connectedTowers[z]);
            if (keys.length>0) {
                for (let i=0;i<keys.length;i++) {
                    if (this.connectedTowers[z][keys[i]] in connectionObj) {
                        connectionObj[this.connectedTowers[z][keys[i]]].push(keys[i]);
                    }
                    else {
                        connectionObj[this.connectedTowers[z][keys[i]]]=[keys[i]];
                    }
                }
            }
            connections.push(connectionObj);
        }

        // Loop for stairs and doors, lots of similarities, so same loop
        for (let z=this.possibleStairs.length-1;z>=0;z--) {
            const keys=Object.keys(connections[z]);
            // Any stairs to build?
            if (keys.length>0) {
                for (let i=0; i<keys.length;i++) {
                    let breaker=0;
                    let success=false;
                    while (breaker<20 && !success) {
                        breaker++;
                        const towerChosen = random.selection(connections[z][keys[i]]);
                        const stairRange = this.possibleStairs[z][towerChosen][0];
                        // // Add stairs
                        if (z>0) {
                            const stairPos = [random.range(stairRange[0][0]+1, stairRange[1][0]-1), random.range(stairRange[0][1]+1, stairRange[1][1]-1)];
                            if (fullMap[z][stairPos[1]][stairPos[0]].canOverwrite() && fullMap[z][stairPos[1]][stairPos[0]].isPassable() && fullMap[z-1][stairPos[1]][stairPos[0]].canOverwrite() && fullMap[z-1][stairPos[1]][stairPos[0]].isPassable()) {
                                fullMap[z][stairPos[1]][stairPos[0]].makeStairs(false);
                                fullMap[z-1][stairPos[1]][stairPos[0]].makeStairs(true);
                                success=true;
                            }
                        }
                        else {
                            const startPosition = [random.range(stairRange[0][0]+2, stairRange[1][0]-2), random.range(stairRange[0][1]+2, stairRange[1][1]-2)];
                            const directions = [[0,1],[0,-1],[1,0],[-1,0]];
                            for (let j=0;j<4;j++) {
                                let breaker=0;
                                let hitWall=false;
                                const position = [...startPosition];
                                while (breaker<50 && !hitWall) {
                                    breaker++;
                                    if (this.withinMap(position) && fullMap[z][position[1]][position[0]].isExterior() && !fullMap[z][position[1]][position[0]].isPassable()) {
                                        fullMap[z][position[1] - directions[j][1]][position[0] - directions[j][0]].makeFloor();
                                        fullMap[z][position[1]][position[0]].makeDoor();
                                        hitWall=true;
                                        success=true;
                                    }
                                    position[0] += directions[j][0];
                                    position[1] += directions[j][1];
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    postProcessing(fullMap) {
        for (let z=this.towerHeight-1; z>=0;z--) {
            for (let i=0;i<this.dimensions[0];i++) {
                for (let j=0;j<this.dimensions[1];j++) {
                    if (fullMap[z][j][i].isDefault()) {
                        if (z===0) {
                            fullMap[z][j][i].makeGrass();
                        }
                        else if (!fullMap[z-1][j][i].isDefault()) {
                            fullMap[z][j][i].makeFloor();
                        }
                        fullMap[z][j][i].exterior=true;
                    }
                    else if (fullMap[z][j][i].isExterior() && !fullMap[z][j][i].isPassable(true)) {
                        if (random.random()>(0.99 - z * 0.005)) {
                            fullMap[z][j][i].makeWindow();
                        }
                    }
                }
            }
        }
    },
    populateLevel(level,z) {
        const availableTiles=[];
        const availableItemTiles=[]; // I want to be stricter about where items spawn; no items on roofs!
        level.forEach((row,j)=>{
            row.forEach((tile,i)=> {
                if (tile.isFloor() && tile.isPassable()) {
                    if (!tile.isExterior()) {
                        availableTiles.push([i,j,z]);
                        availableItemTiles.push([i,j,z]);
                        if (random.random()>0.99) {
                            new Doodad([i,j,z],this.addDoodad(z));
                        }
                    }
                    else if (z>=1) {
                        availableTiles.push([i,j,z]);
                    }
                }
            });
        });
        const podsToAdd = Math.ceil(availableTiles.length / 200);
        if (availableTiles.length) {
            for (let i=0;i<podsToAdd;i++) {
                if (z === this.towerHeight-2 && i===0) {
                    const position = random.selection(availableItemTiles);
                    level[position[1]][position[0]].item = getItem('sixela');
                    this.addPod(position,['spikemom','spikeman','spikeman','spikeman','spike','spike','spike','spike','spike']);
                }
                else if (i>=(podsToAdd/2) && availableItemTiles.length>0) {
                    this.addPod(random.selection(availableItemTiles),this.choosePod(z,3+z));
                }
                else {
                    this.addPod(random.selection(availableTiles),this.choosePod(z,3+z));
                }
            }
        }
        if (availableItemTiles.length > 0) {
            for (let i=0;i<Math.min(10,2*podsToAdd);i++) {
                const position = random.selection(availableItemTiles);
                if (!level[position[1]][position[0]].item) {
                    if (z===4 && i===0) {
                        if (random.random()>0.5) {
                            level[position[1]][position[0]].item = getItem('rocket');
                        }
                        else {
                            level[position[1]][position[0]].item = getItem('hookshot');
                        }
                    }
                    else {
                        level[position[1]][position[0]].item = getItem(this.addItem(z));
                    }
                }
            }
        }
    },
    addDoodad(level) {
        const weights = {
            'candle':4,
            'statue':5,
            'chest':this.probabilityFunction(level,2,26,2),
            'table':5,
            'barrel':this.probabilityFunction(level,0,12,8,2),
        }
        return random.weighted(weights);
    },
    addItem(level) {
        const weights = {
            'potion':this.probabilityFunction(level,0,26,10),
            'smallfood':5,
            'mediumfood':this.probabilityFunction(level,0,12,8),
            'bigfood':this.probabilityFunction(level,0,26,10),
            'weighted':this.probabilityFunction(level,10,20,2),
            'plate':this.probabilityFunction(level,18,26,3),
            'chain':this.probabilityFunction(level,10,20,3,1,23),
            'leather':this.probabilityFunction(level,3,15,3,1,19),
            'sonic mallet':this.probabilityFunction(level,16,26,2),
            'golf club':this.probabilityFunction(level,5,20,2),
            'rocket':this.probabilityFunction(level,4,20,3),
            'hookshot':this.probabilityFunction(level,4,20,5),
            'jetpack':this.probabilityFunction(level,10,20,2),
            'sword':1,
            'bat':this.probabilityFunction(level,0,0,3,1,10),
        }
        return random.weighted(weights);
    },
    addPod(position,composition) {
        let breaker=0;
        let limit=4*composition.length;
        let i,j;
        while (composition.length>0 && breaker<limit) {
            breaker++;
            let tile=null;
            for (i=-breaker;i<breaker;i++) {
                for (j=-breaker;j<breaker;j++) {
                    tile = map.getTile([position[0]+i, position[1]+j,position[2]]);
                    if (composition.length>0 && tile && tile.isFloor() && tile.isPassable() && (!tile.isExterior() || position[2]>=1)) {
                        new Monster([position[0]+i, position[1]+j,position[2]],composition.pop());
                    }
                }
            }
        }
    },
    choosePod(level,danger) {
        const dangerRatings = {
            'small orb':1,
            'spike':1,
            'splodey':3,
            'large orb':6,
            'spikeman':6,
            'roambo':2,
            'drone':1,
        }
        const options = {
            'small orb':this.probabilityFunction(level,0,0,5,1,30),
            'spike':this.probabilityFunction(level,0,10,6,2,30),
            'drone':this.probabilityFunction(level,8,20,3),
            'large orb':this.probabilityFunction(level,6,20,3),
            'spikeman':this.probabilityFunction(level,10,20,3),
            'splodey':this.probabilityFunction(level,5,15,3,1,24),
            'roambo':this.probabilityFunction(level,10,15,3,1,20),
        }
        const pod=[];
        let breaker=10;
        let option='';
        while(danger > 0 && breaker>0) {
            breaker--;
            option = random.weighted(options);
            if (dangerRatings[option]<=danger) {
                pod.push(option);
                danger -= dangerRatings[pod[pod.length-1]];
            }
        }
        return pod;
    },
    probabilityFunction(level, minLevel,peakLevel,peakValue, minValue=1, maxLevel=Infinity) {
        if (level<minLevel || level > maxLevel) {
            return 0;
        }
        else if (level < peakLevel) {
            return Math.max(minValue,Math.ceil(peakValue * (level - minLevel) / (peakLevel - minLevel)));
        } 
        else if (isFinite(maxLevel)) {
            return Math.max(minValue,Math.ceil(peakValue * (maxLevel - level) / (maxLevel - peakLevel)));
        }
        else {
            return peakValue;
        }
    },
    addFrontDoor(level) {
        const position = [Math.round(mapGenerator.dimensions[0]/2),Math.round(mapGenerator.dimensions[1]-mapGenerator.border/2),0];
        for (let i=0;i<20;i++) {
            for (let k=-1;k<2;k+=2) {
                for (let j=0;j<10;j++) {
                    const testPosition = [position[0]+k*j, position[1]-i];
                    if (roomBuilder.validForDoor(level,testPosition[0],testPosition[1])) {
                        level[testPosition[1]][testPosition[0]].makeDoor();
                        return;
                    }
                }
            }
        }
    }
}

export default mapGenerator;