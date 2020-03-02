// All gameboard logic
const gameBoard = {
    dimensions: [30,30],
    tiles: [],
    gridElement: null,
    // Initialize
    init() {
        this.gridElement = document.getElementById('grid');
        this.setDimensions([30,30]);
    },

    // Set new dimensions for the map
    setDimensions(newDimensions) {
        this.dimensions = [...newDimensions];
        this.allocateTiles();
    },

    // Prepare the map for display
    allocateTiles() {
        // Clear the old grid
        this.emptyGrid();

        // Determine number of tiles to allocate
        const numberOfTiles = this.dimensions[0] * this.dimensions[1];

        // Generate each one...
        for (let i=0; i<numberOfTiles;i++) {
            // The element representing the tile
            const newTileElement = document.createElement('div');
            newTileElement.classList.add('tile');

            // The "art"
            const newTileArt = document.createElement('div');
            newTileArt.classList.add('tileArt');
            newTileArt.textContent = ' ';

            // Put them where they need to be
            newTileElement.appendChild(newTileArt);
            this.gridElement.appendChild(newTileElement);

            // Store for later
            this.tiles.push(newTileElement);
        }
    },

    // Empty the grid. Dump that sucker into the trash!
    emptyGrid() {
        while(this.gridElement.firstChild) {
            this.gridElement.removeChild(this.gridElement.lastChild);
        }
        this.tiles = [];
    },

    // Set tile properties
    setTile() {
        
    }
};

export default gameBoard;