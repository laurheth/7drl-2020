import gameBoard from './gameBoard.js';

const mapGenerator = {
    dimensions: null,
    // Run the generator, given some dimensions
    generate(dimensions) {
        this.dimensions = dimensions;
        gameBoard.setDimensions(dimensions);
        for (let i=0;i<dimensions[0];i++) {
            for (let j=0;j<dimensions[1];j++) {
                if (i===0 || j===0 || i===(dimensions[0]-1) || j===(dimensions[1]-1)) {
                    gameBoard.setTile([i,j],'#');
                }
                else {
                    gameBoard.setTile([i,j],'.');
                }
                gameBoard.seeTile([i,j]);
            }
        }
    }
}

export default mapGenerator;