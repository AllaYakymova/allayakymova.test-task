import './styles/index.scss';
import "bootstrap";
import GameDiv from "./scripts/GameDiv";

// создание новой игры
let newGameDiv = new GameDiv(650, 550, 0, 2, 70,100, 10, 60);

// запуск новой игры
newGameDiv.manageGame();
