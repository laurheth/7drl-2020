// Javascript will go here
import gameBoard from './gameBoard.js';
import mapGenerator from './mapGenerator.js';
import Player from './player.js';
import map from './map.js';

gameBoard.init();
mapGenerator.generate();
map.display(0);

const player = new Player([4,4,0]);

gameBoard.toggleAnimateView();