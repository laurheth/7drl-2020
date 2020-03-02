// Javascript will go here
import gameBoard from './gameBoard.js';
import mapGenerator from './mapGenerator.js';

gameBoard.init();

mapGenerator.init(gameBoard);

mapGenerator.generate([30,30]);