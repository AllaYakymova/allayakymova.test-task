import {TaskTimer} from "tasktimer";

export  default class GameDiv {
    constructor(fieldWidth, fieldHeight, minAddedBlocks, maxAddedBlocks, minBlockWidth, maxBlockWidth, startBlocksCount, secDuration ) {
        this._fieldWidth = fieldWidth;
        this._fieldHeight = fieldHeight;
        this._minAddedBlocks = minAddedBlocks;
        this._maxAddedBlocks = maxAddedBlocks;
        this._minBlockWidth = minBlockWidth;
        this._maxBlockWidth = maxBlockWidth;
        this._startBlocksCount = startBlocksCount;
        this._secDuration = secDuration;
        this._timer = new TaskTimer(1000);
        this._task = ([
            {
            id: 'task-1',
            tickInterval: 1,
            totalRuns: this._secDuration+1,
            callback: ((task) => {
                let difference = task.totalRuns - task.currentRuns;
                let minutes = Math.floor(difference / 60) | 0;
                let seconds = Math.floor(difference % 60) | 0;
                minutes = minutes < 10 ? "0" + minutes : minutes;
                seconds = seconds < 10 ? "0" + seconds : seconds;
                this.display.innerText = minutes + ":" + seconds;
                if(task.currentRuns === task.totalRuns) {
                    this._timer.reset();
                    this.openModal(this.scoreBoard.innerText);
                }
            })
        }]);
    }
    // DOM элементы
    newGameBtn = document.getElementById("game-new");
    pauseStartBtn = document.getElementById("game-starter");
    field = document.getElementById("field");
    modal = document.getElementById('modal');
    modalScore = document.getElementById("modal-score");
    display = document.getElementById("countdown");
    scoreBoard = document.getElementById("points");
    winnersTab = document.getElementById("results");
    input = document.getElementById("formInput");

    // массив данных для localStorage
    winners = JSON.parse(localStorage.getItem('winners')) || [];

    randomiser = (min, max) => Math.floor(Math.random() * (max + 1 - min) ) + min;

    // устанвление базовых параметров блока (цвет, размер, положение на поле)
    setBlockParams() {
        return {
            color: 'rgb('+this.randomiser(0,255)+', '+this.randomiser(0,255)+', '+this.randomiser(0,255)+')',
            side: this.randomiser(this._minBlockWidth, this._maxBlockWidth),
            top: this.randomiser(0, this._fieldHeight - this._maxBlockWidth),
            left: this.randomiser(0, this._fieldWidth - this._maxBlockWidth)
        };
    }

    // добавление начальных блоков на поле перед игрой
    startOfGamePosition() {
        let count = this._startBlocksCount;
        for (let i = 1; i <= count; i++) {
            this.addBlock(i)
        }
    }

    // создание игрового окна
    implementGameField() {
        this.field.style.width = this._fieldWidth + "px";
        this.field.style.height = this._fieldHeight + "px";
    }

    // очищение поля от блоков старой игры
    clearGameField = () => this.field.innerHTML = "";

    // создание блока
    createBlock(item, id) {
        let block = document.createElement( "div");
        block.setAttribute("id", id);
        block.classList.add("main__block");
        if(item.side <= this._minBlockWidth*1.1) {
            block.setAttribute("style", `background-color: ${item.color}; width: ${item.side}px; height: ${item.side}px; top: ${item.top}px; left: ${item.left}px; border-radius: 50%;`);
        } else  {
            block.setAttribute("style", `background-color: ${item.color}; width: ${item.side}px; height: ${item.side}px; top: ${item.top}px; left: ${item.left}px;`);
        }

        return block;
    }

    // добавление блоков на поле
    addBlock(id) {
        let blockParam = this.setBlockParams();
        let block = this.createBlock(blockParam, id);
        this.field.insertAdjacentElement("beforeend", block);
    }

    // рандомное определние количества добавляемых блоков
    countNewBlocks() {
       return this.randomiser(this._minAddedBlocks, this._maxAddedBlocks)
    }

    // открытие модалки
    openModal(count) {
        this.modal.style.display = "block";
        this.modalScore.value = `${count}`;
        this.pauseStartBtn.innerText = "Start";
    };

    // вход в игру. Ивенты, управление ими
    manageGame() {
        let count = this._startBlocksCount;
        let score = 0;
        this.scoreBoard.innerText = `${score}`;
        this.implementGameField();
        this.implementStorageData();

        //Events
        const gamePatternEvent = (e) => {
             this.newGameBtn.removeEventListener("click", gameStartTimer);
            let target = e.target;
            if (target.id !== "field") {
                if(target.style.borderRadius !== `50%`) {
                    ++score;
                } else {
                    score = score+2;
                }
                 this.scoreBoard.innerText = `${score}`;
                target.remove();
                let toAdd = +this.countNewBlocks();
                for (let i = 0; i < toAdd; i++) {
                    this.addBlock(count);
                    count++;
                }
            }
            if( this.field.innerHTML === "") {
                count = this._startBlocksCount;
                score = 0;
                this.openModal( this.scoreBoard.innerText);
                this._timer.reset();
                this.display.innerText = "00:00";
            }
        };

        const gameStartTimer = () => {
            this._timer.reset();
            this._timer.add(this._task).start();
             this.newGameBtn.removeEventListener("click", gameStartTimer);
        };

        const pauseStartEvent = (e) => {
            let target = e.target;
            if (target.innerText === "PAUSE") {
                target.innerText = "start";
                this._timer.pause();
            } else if (target.innerText === "START") {
                target.innerText = "pause";
                this._timer.resume();
            }
             this.field.onclick = () => {
                target.innerText = "pause";
                this._timer.resume();
            }
        };

        const startGame = () => {
            score = 0;
            this.pauseStartBtn.innerText = "Pause";
            this.clearGameField();
            this.startOfGamePosition();
            setTimeout(() =>  this.field.addEventListener("click", gamePatternEvent), 1000);
            gameStartTimer();
        };

        const modalEvent = (e) => {
            let target = e.target;

            if (target.id === "save-results") {
                e.preventDefault();
                if(this.input.value.length === 0) {
                    alert("Enter your name, please!");
                } else {
                    this.modal.style.display = "none";
                    this.saveResult(this.scoreBoard.innerText);
                    this.clearGameField();
                    this.scoreBoard.innerText = "0";
                }
            }
        };
         this.newGameBtn.addEventListener("click", startGame);
         this.pauseStartBtn.addEventListener("click", pauseStartEvent);
         this.modal.addEventListener("click", modalEvent);
    };

    // Сохранение результатов
    saveResult = (count) => {
        this.input.oninput = () => this.input.value;
        this.implementResultsTab([this.input.value, count]);
    };

    // отображение результатов игры в таблице результатов
    implementResultsTab = ([name, count]) => {
       this.winners = [...this.winners, {name:name, count:count}];
       localStorage.setItem("winners", JSON.stringify(this.winners));

       let str = `<tr><td class="tab-cell">${name}</td><td class="tab-cell">${count}</td></tr>`;
       this.winnersTab.insertAdjacentHTML("beforeend", str);
    };

    // отображение результатов данных из localStorage в таблице результатов
    implementStorageData = () => {
        window.onload = () => {
            let data = JSON.parse(localStorage.getItem('winners'));
           data.forEach((item) => {
               let str = `<tr'><td class="tab-cell">${item.name}</td><td class="tab-cell">${item.count}</td></tr>`;
               this.winnersTab.insertAdjacentHTML("beforeend", str);
           })
        }
    }
};