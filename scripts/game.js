// Javascript will go here
import gameBoard from './gameBoard.js';
import mapGenerator from './mapGenerator.js';
import Player from './player.js';
import map from './map.js';
import actionQueue from './actionQueue.js';
import animator from './animator.js';

gameBoard.init();
mapGenerator.generate();
map.display(0);

actionQueue.add(animator);

const player = new Player([Math.round(mapGenerator.dimensions[0]/2),Math.round(mapGenerator.dimensions[1]-mapGenerator.border/2),0]);
map.player=player;

const statsButton=document.getElementById('statsButton');
const statsHolder=document.getElementById('statsHolder');
statsButton.addEventListener('click',(event)=>{
    event.preventDefault();
    statsButton.classList.toggle('clicked');
    statsHolder.classList.toggle('open');
});

actionQueue.run();
gameBoard.sendMessage(`Welcome to the Tower of Tension! The Legendary Hammer of Sixela is at the top, and your quest is to get it. Good luck!`,['good','important']);