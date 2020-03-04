// Javascript will go here
import gameBoard from './gameBoard.js';
import mapGenerator from './mapGenerator.js';
import Player from './player.js';
import Monster from './monsters.js';
import map from './map.js';
import actionQueue from './actionQueue.js';

gameBoard.init();
mapGenerator.generate();
map.display(0);


const player = new Player([Math.round(mapGenerator.dimensions[0]/2),Math.round(mapGenerator.dimensions[1]-mapGenerator.border/2),0]);
const monster = new Monster([Math.round(mapGenerator.dimensions[0]/2)+10,Math.round(mapGenerator.dimensions[1]-mapGenerator.border/2),0]);
map.player=player;

actionQueue.act();

gameBoard.toggleAnimateView();