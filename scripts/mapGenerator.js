const mapGenerator = {
    board: null,
    dimensions: null,
    // Initialize the map generator
    init(gameBoardReference) {
        this.board = gameBoardReference;
    },
    // Run the generator, given some dimensions
    generate(dimensions) {
        this.dimensions = dimensions;
        this.board.setDimensions(dimensions);
        for (let i=0;i<dimensions[0];i++) {
            for (let j=0;j<dimensions[1];j++) {
                if (i===0 || j===0 || i===(dimensions[0]-1) || j===(dimensions[1]-1)) {
                    this.board.setTile([i,j],'#');
                }
                else {
                    this.board.setTile([i,j],'.');
                }
                this.board.seeTile([i,j]);
            }
        }
    }
}

export default mapGenerator;