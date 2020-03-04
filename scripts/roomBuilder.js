import random from './random.js';

const roomBuilder = {
    rectangle(level, minCorner, maxCorner) {
        if (this.roomWillFit(level, minCorner, maxCorner)) {
            const possibleExits = [];
            for (let i = minCorner[0]; i <= maxCorner[0]; i++) {
                for (let j = minCorner[1]; j <= maxCorner[1]; j++) {
                    if (!level[j][i].isExterior()) {
                        if (i === minCorner[0] || i === maxCorner[0] || j === minCorner[1] || j === maxCorner[1]) {
                            level[j][i].makeWall();
                            possibleExits.push([i, j]);
                        }
                        else {
                            level[j][i].makeFloor();
                        }
                    }
                }
            }
            let numDoors = random.range(2, 4);
            if (possibleExits.length > 0) {
                let breaker = 0;
                while (breaker < 20 && numDoors > 0) {
                    breaker++;
                    const position = random.selection(possibleExits);
                    if (this.addDoor(level, position[0], position[1])) {
                        numDoors--;
                    }
                }
            }
        }
    },

    roomWillFit(level,minCorner,maxCorner) {
        for (let i = minCorner[0]-1; i<= maxCorner[0]+1; i++) {
            for (let j=minCorner[1]-1; j<= maxCorner[1]+1; j++) {
                if (!level[j][i].isPassable()) {
                    return false;
                }
            }
        }
        return true;
    },

    hallWay(level, start, end, minLength = 10) {
        if (Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1]) < minLength) {
            return false;
        }
        if (this.validPosition(level, start[0], start[1]) && this.validPosition(level, end[0], end[1])) {
            level[start[1]][start[0]].makeFloor(true);
            level[end[1]][end[0]].makeFloor(true);
            const direction = [0, 0];
            let position = [...start];
            while (Math.abs(end[0] - position[0]) > 0 || Math.abs(end[1] - position[1]) > 0) {
                if (Math.abs(position[0] - end[0]) > Math.abs(position[1] - end[1])) {
                    direction[1] = 0;
                    direction[0] = Math.sign(-position[0] + end[0]);
                }
                else {
                    direction[0] = 0;
                    direction[1] = Math.sign(-position[1] + end[1]);
                }
                position = position.map((x, i) => x + direction[i]);
                // console.log(position, end);
                if (level[position[1]][position[0]].isExterior()) {
                    for (let i = -1; i < 2; i++) {
                        for (let j = -1; j < 2; j++) {
                            if (i !== 0 || j !== 0) {
                                if (Math.abs(end[0] - position[0]) > 1 || Math.abs(end[1] - position[1]) > 1) {
                                    if (level[position[1]+j][position[0]+i].isExterior()) {
                                        level[position[1] + j][position[0] + i].makeExterior();
                                    }
                                }
                            }
                            else {
                                level[position[1] + j][position[0] + i].makeFloor(true);
                            }
                        }
                    }
                }
            }
            return true;
        }
        else {
            return false;
        }
    },

    // Check if valid, and, if so, add a door
    addDoor(level, column, row, force = false) {
        if (force || this.validForDoor(level, column, row)) {
            level[row][column].makeDoor();
            return true;
        }
        else {
            return false;
        }
    },
    // Check if valid for a door; we may not always do this
    validForDoor(level, column, row) {
        let walls = [0, 0];
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (!level[j + row][i + column].isPassable()) {
                    if (i === 0) {
                        walls[0]++;
                    }
                    if (j === 0) {
                        walls[1]++;
                    }
                }
                if (level[j + row][i + column].isDoor()) {
                    return false;
                }
            }
        }
        if ((walls[0] === 3 && walls[1] === 1) || (walls[1] === 3 && walls[0] === 1)) {
            return true;
        }
    },
    validPosition(level, column, row) {
        let valid = true;
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                valid &= !level[row + j][column + i].isExterior();
                valid &= level[row + j][column + i].isPassable();
            }
        }
        return valid;
    }
};

export default roomBuilder;