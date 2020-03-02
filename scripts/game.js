// Javascript will go here
import gameBoard from './gameBoard.js';
import mapGenerator from './mapGenerator.js';
import Player from './player.js';

gameBoard.init();
mapGenerator.generate([15,15]);

const player = new Player([4,4]);

gameBoard.toggleAnimateView();