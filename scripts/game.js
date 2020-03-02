// Javascript will go here
import gameBoard from './gameBoard.js';
import mapGenerator from './mapGenerator.js';
import Player from './player.js';

gameBoard.init();

const player = new Player();

mapGenerator.generate([15,15]);

gameBoard.setViewPosition([15,15]);