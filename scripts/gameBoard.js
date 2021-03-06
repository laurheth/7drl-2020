// All gameboard logic
const gameBoard = {
    dimensions: [30,30],
    tiles: [],
    gridElement: null,
    currentLevel: 0,
    lastMessage: '',
    lastMessageElement:null,
    repeats:0,
    messagesClosed:0,
    menuOn:false,
    statsButton:null,
    statsMenu:null,
    // Initialize
    init() {
        this.gridElement = document.getElementById('grid');
        this.setDimensions([30,30]);
        this.messageElement = document.getElementById('messages');

        this.statsButton=document.getElementById('statsButton');
        this.statsHolder=document.getElementById('statsHolder');
        statsButton.addEventListener('click',(event)=>{
            event.preventDefault();
            this.setMenu(!this.menuOn);
        });

    },

    setMenu(open=true) {
        this.menuOn=open;
        if (open) {
            this.statsButton.classList.add('clicked');
            this.statsHolder.classList.add('open');
        }
        else {
            this.statsButton.classList.remove('clicked');
            this.statsHolder.classList.remove('open');
        }
    },

    // Set new dimensions for the map
    setDimensions(newDimensions) {
        this.dimensions = [...newDimensions];
        // grid-template-columns: repeat(30, 1rem);

        this.gridElement.style['grid-template-columns'] = `repeat(${newDimensions[0]},1rem)`
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
            newTileElement.classList.add('tile', 'hidden'); // Tile defaults to hidden until seen

            // The "art"
            const newTileArt = document.createElement('div');
            newTileArt.classList.add('art');
            newTileArt.textContent = '#';

            // Put them where they need to be
            newTileElement.appendChild(newTileArt);
            this.gridElement.appendChild(newTileElement);

            // Store for later
            this.tiles.push(newTileElement);
        }
    },

    // Empty the grid of all tiles
    emptyGrid() {
        this.tiles.forEach((tile)=>{
            tile.remove();
        })
        this.tiles = [];
    },

    isOnMap(position) {
        if (position && position.length >= 2) {
            return position[0] >= 0 && position[1] >= 0 && position[0] < this.dimensions[0] && position[1] < this.dimensions[1];
        }
        return false;
    },

    // Get index from a position
    getIndex(position) {
        if (this.isOnMap(position)) {
            return position[1] * this.dimensions[0] + position[0]; 
        }
        return -1;
    },

    // Set tile properties
    setTile(position,character='',background='',foreground='',below=false) {
        if (position.length>2) {
            if (position[2] !== this.currentLevel) {
                return;
            }
        }
        const index = this.getIndex(position);
        if (index >= 0) {
            // Get the tile element
            const tileElement = this.tiles[index];
            // It's only child is the "art" element. So get that and set it's inner text.
            if (character) {
                tileElement.firstChild.innerText = character;
            }

            if (background || foreground) {
                background = (background) ? background : '#000000';
                foreground = (foreground) ? foreground : '#FFFFFF';
                tileElement.style.background = background;
                tileElement.style.color = foreground;
            }
            if (below) {
                tileElement.style.opacity = 0.4;
            }
            else {
                tileElement.style.opacity = 1;
            }
        }
    },

    // See tile
    seeTile(position) {
        const index = this.getIndex(position);
        if (index >= 0) {
            const tileElement = this.tiles[index];
            tileElement.classList.remove('hidden', 'memory');
        }
    },

    // Unsee tile
    unseeTile(position) {
        const index = this.getIndex(position);
        if (index >= 0) {
            const tileElement = this.tiles[index];
            // Tile becomes a memory, but does not become hidden
            tileElement.classList.add('memory');
        }
    },

    hideTile(position) {
        const index = this.getIndex(position);
        if (index >= 0) {
            const tileElement = this.tiles[index];
            // Tile becomes a memory, but does not become hidden
            tileElement.classList.add('hidden');
        }
    },

    // Set as a memory, for when we return to a map later
    setMemory(position) {
        const index = this.getIndex(position);
        if (index >= 0) {
            const tileElement = this.tiles[index];
            tileElement.classList.remove('hidden');
            tileElement.classList.add('memory');
        }
    },

    // Set as never been seen
    setAsUnseen(position) {
        const index = this.getIndex(position);
        if (index >= 0) {
            const tileElement = this.tiles[index];
            tileElement.classList.remove('memory');
            tileElement.classList.add('hidden');
        }
    },

    // Set vision position
    setViewPosition(position) {
        if (position && position.length >= 2) {
            const translation = position.map((x,index) => {
                return -100 * ((x+0.5) / this.dimensions[index]);
            });
            this.gridElement.style.transform = `translate(${translation[0]}%,${translation[1]}%)`
        }
    },

    toggleAnimateView(animate=true) {
        if (animate) {
            // Delay this slightly to ensure the transition "none" goes through
            // setTimeout(()=>this.gridElement.style.transition = 'transform 0.1s',100);
        }
        else {
            // this.gridElement.style.transition = 'none';
        }
    },

    sendMessage(message,type='',final=false) {
        if (!this.messagesClosed) {
            if (message !== this.lastMessage) {
                this.lastMessage = message;
                this.repeats=1;
                const newMessage = document.createElement('p');
                newMessage.textContent=message;
                if (type) {
                    if (Array.isArray(type)) {
                        newMessage.classList.add(...type);
                    }
                    else {
                        newMessage.classList.add(type);
                    }
                }
                this.messageElement.prepend(newMessage);
                while (this.messageElement.children.length > 10) {
                    this.messageElement.lastChild.remove();
                }
                this.lastMessageElement = newMessage;
            }
            else {
                this.repeats++;
                this.lastMessageElement.textContent = `${message} (${this.repeats})`
            }
        }

        if (final) {
            this.messagesClosed=true;
        }
    }

};

export default gameBoard;