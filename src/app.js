import { LitElement, html } from 'lit-element'; 
import { Player } from './player.js';
import { sleep, shuffle } from './functions.js';
import { Api } from './api.js'

let players = [];
players.push(new Player("you", "0.png", "notReady", 0));
players.push(new Player("player1", "0.png", "notReady", 0));
players.push(new Player("player2", "0.png", "ready", 0));
players.push(new Player("player3", "0.png", "ready", 0));
//const api = new Api();

class ImApp extends LitElement {
  static get properties() {
    return {
      state: { type: String }, //defines current application render and behavior
      players: { type: Array }, //all players array
      host: { type: Player },   //this session player
      checkLock: { type: Boolean }, //lock that prevents run same async func multiple times
      gameLeader: { type: Player }, //current player who is guessing a card
      gameLeaderId: { type: Number }, //his ID in array of players in gameQueue
      gameQueue: { type: Array }, //shuffeled array of players
      hostCards: { type: Array }, //this session player's cards
      initLock: { type: Boolean }, //lock that prevents from multiple game init to exec
      hostChoosenCard: { type: Object },
      leaderGuess: { type: String },
      turnCards: { type: Array },
    };
  }

  constructor() {
    super();
    this.players = players;
    //this.setupApi();
   
    this.host = players[0];
    this.checkLock = false;
    this.initLock = false;

    this.gameLeader = this.host;
    this.leaderGuess = 'what ever';

    this.initGame();
    //this.state = 'wait pl';
    //this.state = 'lobby';
    //this.state = "game guess";this.initGameGuess();
    //this.state = 'game turn';this.initGameTurn();
    //this.state = 'game think';this.initGameThink();
    //this.state = 'game result';this.initGameResult();
    //this.state = 'game wait'; this.initGameWait();
    this.state = 'game pick'; this.initGamePick();
  }

  render() {
    switch (this.state) {
      case 'wait pl': this.waitPlease(); return html``; break;
      case 'lobby': this.lobbyChecker(); return this.lobby(); break;
      case 'game guess': return this.gameGuess(); break;
      case 'game wait': return this.gameWait(); break;
      case 'game turn': this.gameTurnChecker(); return this.gameTurn(); break;
      case 'game think': this.gameThinkChecker(); return this.gameThink(); break;
      case 'game result': return this.gameResult();
      case 'game pick': this.gamePickChecker(); return this.gamePick(); break;
      default: return html`not found`; 
    }
  }

  setupApi() {
    this.apiRef = api;
    api.on('getHostCard', () => this.hostCard());
    api.on('updatePlayers', (players) => { 
      if (this.players.length < players.length) {
        for (let i = 0; i < players.length; i++)
          players[i] = Player.fromJSON(players[i]);
        this.players = players.slice();
      }
    });

    api.on('newPlayer', (player) => { 
      this.players.push(Player.fromJSON(player));
      this.requestUpdate();

      api.send('updatePlayers', this.players);
    });

    api.on('removePlayer', (player) => {
      player = Player.fromJSON(player);
      console.log(player);
      console.log(this.players);
      this.players = this.players.filter(pl => pl.name !== player.name);
      console.log('here boi');
      console.log(this.players);
    });
    window.addEventListener('beforeunload', () => 
      api.send('removePlayer', api.client));
   }

  async waitPlease() {
    while (
      this.players.length === 0
    ) await sleep(500);
    this.state = 'lobby';
    this.host = players[0];
  }

  gameDrawSidebar() {
    return html`
      <div class="sidebar">
        <div class="playerList">
          ${this.players.filter(player => player !== this.gameLeader).map(player => html`
            <div class="player ${player.status}">
              <img class="playerImage" src="../img/avatars/${player.icon}">
              <div class="playerSnN">
                <div class="playerName">${player.name}</div>
                <div class="playerStatus">${player.status}</div>
              </div>
              <span class="playerScore">${player.score}</span>
              <div class="player ${player.status}">
            </div>
          `)}
        </div>
    `;
  }

  gameDrawLeader() {
    return html`
    <div class="leader">
      <div class="leaderWrap">
        <img class="leaderImage" src="../img/avatars/${this.gameLeader.icon}">
        <span class="leaderName">${this.gameLeader.name}</span>
        <span class="playerScore">${this.gameLeader.score}</span>
      </div>
      <div class="leaderGuess">${this.leaderGuess}</div>
      <hr class="leaderUnderline">
    </div>
    `;
  }

  async gameResultCountDown() {
    for (let i = 0; i < 5; i++) {
      await sleep(1000);
    }
    this.initGameIteration();
  }

  initGameResult() {
    this.turnCards = [ "card0.jpeg", "card1.jpeg", "card3.jpeg", "card2.jpeg" ];

    this.leaderCard = this.turnCards[2];
    this.playersChoose = [
      { card: this.turnCards[0], own: this.players[1], 
        players: [this.players[1], this.players[3]] },

      { card: this.turnCards[1], own: this.players[2], players: [] },
      { card: this.turnCards[2], own: this.players[0], players: [this.players[2]] },
      { card: this.turnCards[3], own: this.players[3], players: [] },
    ];

    this.players.map(player => player.status = 'watching');
    this.gameResultCountDown();
  }

  gameResult() {
    return html`
      <div class="gameContainer">
        ${this.gameDrawSidebar()}
        ${this.gameDrawLeader()}

        <div class="cardsContainer">
          ${this.playersChoose.map(choose => html`
            <div class="card preview ${
              choose.card === this.leaderCard ? "leader" : "common"}">
              <div class="wrap">
                <img class="cardImage" src="../img/cards/${choose.card}">
                <img class="cardOwner" src="../img/avatars/${choose.own.icon}">
                <div class="pickedPlayers">
                  ${choose.players.map(player => html`
                    <img class="pickedPlayer" src="../img/avatars/${player.icon}">
                  `)}
              </div>
              </div>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  async gameThinkChecker() {
    if (this.checkLock === true) return;
    this.checkLock = true;
    while (
      this.players.filter(player => player.status === 'thinking').length !== 0
    ) await sleep(500);
    await sleep(1000);
    this.initGameResult();
    this.state = 'game result';
    this.checkLock = false;
  }

  async test2() {
    await sleep(1000);
    this.players[2].status = "waiting";
    this.requestUpdate();

    await sleep(500);
    this.players[1].status = "waiting";
    this.requestUpdate();

    await sleep(500);
    this.players[3].status = "waiting";
    this.requestUpdate();
  }

  initGameThink() {
    this.players.forEach(player => player.status = "thinking");
    this.host.status = "waiting";
    this.turnCards = [ "card0.jpeg", "card1.jpeg", "card3.jpeg", "card2.jpeg" ];

    this.test2();
  }

  gameThink() {
    return html`
    <div class="gameContainer">
      ${this.gameDrawSidebar()}
      ${this.gameDrawLeader()}

      <div class="cardsContainer">
        ${this.turnCards.map(card => html`
          <div class="card preview" @click="${this.guessCard}">
            <div class="wrap">
              <img class="cardImage" src="../img/cards/${card}">
            </div>
          </div>
        `)}
      </div>


    </div>
    `;
  }

  guessCard(event) {
    if (this.gameLeader !== this.host)
      this.chooseCard(event);
  }

  initGame() {
    if (this.initLock === true) return;
    this.initLock = true;

    this.gameQueue = this.players.slice();
    //shuffle(this.gameQueue);
    this.gameQueue.map(player => player.status = 'waiting');
    this.hostCards = [ "card0.jpeg", "card1.jpeg", "card2.jpeg", "card3.jpeg",
                       "card4.jpeg", "card5.jpeg"];
    this.initLock = false;
    //this.gameLeaderId = -1;
    this.gameLeaderId = 0;
    this.initGameIteration();
  }

  initGameIteration() {
    if (this.initLock === true) return;
    this.initLock = true;
    this.gameLeaderId++;
    if (this.gameLeaderId >= this.gameQueue.length)
      this.gameLeaderId = 0;
    this.gameLeader = this.gameQueue[this.gameLeaderId];

    this.leaderGuess = '';
    this.gameLeader.status = 'guessing';

    this.initLock = false;
    if (this.gameLeader === this.host) {
      this.initGameGuess();
      this.state = 'game guess';
    }
    else {
      this.initGameWait();
      this.state = 'game wait';
    }
  }

  async playersPickingEmulator() {
    const wait = [ 2000, 600, 1000, 500 ];
    for (let i = 0; i < 4; i++) {
      if (this.gameLeaderId !== i && this.players[i] !== this.host) {
        await sleep(wait[i]);
        this.players[i].status = 'waiting';
        this.requestUpdate();
      }
    }
  }

  async gamePickChecker() {
    if (this.checkLock === true) return;
    this.checkLock = true;
    while (
      this.players.filter(player => player.status === 'picking').length !== 0
    ) await sleep(500);
    await sleep(1000);
    this.initGameTurn();
    this.state = 'game turn';
    this.checkLock = false;
  }

  initGamePick() {
    this.players.map(player => player.status = 'picking');
    this.gameLeader.status = 'waiting';
  }

  gamePick() {
    return html`
    <div class="gameContainer">
      ${this.gameDrawSidebar()}
      ${this.gameDrawLeader()}
      
      <div class="cardsContainer">
        ${this.hostCards.map(card => html`
          <div class="card preview" @click="${this.chooseCard}">
            <div class="wrap">
              <img class="cardImage" src="../img/cards/${card}">
            </div>
          </div>
        `)}
      </div>

      <button class="pickButton ${
        this.hostChoosenCard !== undefined ? 'ready' : 'notReady'
      }" @click="${this.pickBtnpick}">
        ${this.hostChoosenCard !== undefined ? 'go' : 'pick a card'}
      </button>

    </div>
    `;
  }

  async pickBtnpick(event) {
    if (this.hostChoosenCard !== undefined) {
      event.currentTarget.classList.add('yep');
      this.host.status = 'waiting';
      this.initGameTurn();
      await sleep(1500);
      this.state = 'game turn';
    }
  }

  async leaderEmulator() {
    await sleep(1500);
    this.leaderGuess = 'whatever';
    this.initGamePick();
    this.state = 'game pick';
  }

  initGameWait() {
    this.leaderEmulator();
  }

  gameWait() {
    return html`
    <div class="gameContainer">
      ${this.gameDrawSidebar()}

      <div class="leader">
        <div class="leaderWrap">
          <img class="leaderImage" src="../img/avatars/${this.gameLeader.icon}">
          <span class="leaderName">${this.gameLeader.name}</span>
          <span class="playerScore">${this.gameLeader.score}</span>
        </div>
        <div class="leaderStatus">${this.gameLeader.status}</div>
        <hr class="leaderUnderline">
      </div>

      <div class="cardsContainer">
        ${this.hostCards.map(card => html`
          <div class="card preview">
            <div class="wrap">
              <img class="cardImage" src="../img/cards/${card}">
            </div>
          </div>
        `)}
      </div>
    </div>
    `;
  }
  

  initGameGuess() {
    if (this.initLock === true) return;
    this.initLock = true;
    this.updateGoBtn(false, false);
    this.initLock = false;
  }

  gameGuess() {
    return html`
    <div class="gameContainer">
      ${this.gameDrawSidebar()}

      <div class="leader">
        <div class="leaderWrap">
          <img class="leaderImage" src="../img/avatars/${this.gameLeader.icon}">
          <span class="leaderName">${this.gameLeader.name}</span>
          <span class="playerScore">${this.gameLeader.score}</span>
        </div>
        <div class="leaderControl" @keyup="${this.keyListener}">
          <input class="guessField" placeholder="Enter your guess"
            value="${this.leaderGuess}" @change="${this.updateGuess}">
        </div>
        <hr class="leaderUnderline">
      </div>

      <div class="cardsContainer">
        ${this.hostCards.map(card => html`
          <div class="card preview" @click="${this.chooseCard}">
            <div class="wrap">
              <img class="cardImage" src="../img/cards/${card}">
            </div>
          </div>
        `)}
      </div>

      <button class="goButton ${this.gameGoBtn !== 'go' ? 'notReady' : 'ready'}"
        @click="${this.goBtnGo}">
        ${this.gameGoBtn}
      </button>
    </div>
    `;
  }

  async test() {
    if (this.gameLeader === this.host) {
      await sleep(500);
      this.players[3].status = 'waiting';
      this.requestUpdate()

      await sleep(500);
      this.players[1].status = 'waiting';
      this.requestUpdate()

      await sleep(1000);
      this.players[2].status = 'waiting';
      this.requestUpdate()
    } else {
      await sleep(5000);
      await sleep(500);
      this.players[2].status = 'waiting';
      this.requestUpdate()

      await sleep(500);
      this.players[3].status = 'waiting';
      this.requestUpdate()
    }
  }

  initGameTurn() {
    if (this.gameLeader === this.host) {
      this.players.map(player => player.status = 'picking');
      this.gameLeader.status = 'waiting';
    }

    this.test();
  }

  async gameTurnChecker() {
    if (this.checkLock === true) return;
    this.checkLock = true;
    while (
      this.players.filter(player => player.status === 'picking').length !== 0
    ) await sleep(500);
    await sleep(1000);
    this.initGameThink();
    this.state = 'game think';
    this.checkLock = false;
  }

  gameTurn() {
    return html`
    <div class="gameContainer">
      ${this.gameDrawSidebar()}
      ${this.gameDrawLeader()}

      <div class="cardsContainer">
        ${this.players.map(player => html`
          <div class="card ${player.status}">
            <div class="wrap">
              <img class="cardImage" src="../img/cardbacksmall.png">
            </div>
          </div>
        `)}
      </div>

    </div>
    `;
  }

  async goBtnGo(event) {
    if (this.gameGoBtn === 'go') {
      event.currentTarget.classList.add('yep');
      this.initGameTurn(this.host, this.leaderGuess);
      await sleep(1500);
      this.state = 'game turn';
    }
  }

  updateGuess(event) {
    this.leaderGuess = event.target.value;
    this.updateGoBtn(this.hostChoosenCard !== undefined, this.leaderGuess !== '');
  }

  setGuess() {
  }

  updateGoBtn(card, guess) {
    if (card && guess) 
      this.gameGoBtn = "go";
    else if (card) 
      this.gameGoBtn = "guess";
    else if (guess)
      this.gameGoBtn = "card";
    else
      this.gameGoBtn = "guess & card";
  }

  keyListener(event) {
    if (event.key === "Enter") this.setGuess();
  }

  chooseCard(event) {
    if (this.hostChoosenCard !== undefined) {
      this.hostChoosenCard.classList.remove("choosen");
    }
    if (this.hostChoosenCard !== event.target) {
      this.hostChoosenCard = event.target;
      event.target.classList.add("choosen");
      this.updateGoBtn(true, this.leaderGuess !== '');
    }
    else { 
      this.hostChoosenCard = undefined;
      this.updateGoBtn(false, this.leaderGuess !== '');
    }
  }

  magnifyCard(event) {
    console.log(event.target);
    if (event.target.tagName === 'DIV') {
      event.currentTarget.classList.remove("magnify");
      event.currentTarget.classList.add("preview");
    }
    else if (event.target.tagName === 'IMG') {
      event.currentTarget.classList.remove("preview");
      event.currentTarget.classList.add("magnify");
    }
    else console.log("¯\\_(ツ)_/¯");
  }

  async lobbyChecker() {
    if (this.checkLock === true) return;
    this.lobbyLock = true;
    while (
      this.players.filter(player => player.status === 'notReady').length !== 0
    ) await sleep(500);
    this.initGame();
    this.checkLock = false;
  }

  lobby() {
    return html`
      <header>
        <span class="nameTag">Imaginarium</span>
        <span class="settings">Settings</span>
        <span class="sound">Sound: On</span>
      </header>
  
      <div class="lobbyContainer">
        <h1>List of players</h1>

        <div class="playerList">
          ${this.players.map(player => html`
            <div class="player ${player.status}">
              <img class="playerImage" src="../img/avatars/${player.icon}">
              <div class="playerName">${player.name}</div>
            </div>
          `)}
        </div>

        <div class="playerCounter">
          <span class="ready">
            ${this.players.filter(player => player.status === "ready").length}
          </span>/<span class="total">
            ${this.players.length}
          </span>
        </div>

        <button class="readyButton ${this.host.status}"
        @click="${this.lobbyReadyButton}">
          ${this.host.status === "ready" ? "not ready" : "ready"}
        </button>
      </div>
    `
  }

  lobbyReadyButton() {
    this.host = this.players[0];
    this.host.status = this.host.status === "ready" ? "notReady" : "ready";
    if (this.players.filter(player => player.status === 'notReady').length === 0)
      this.initGame();
    else
      this.requestUpdate();
  }

  createRenderRoot() { return this }
}

customElements.define('im-app', ImApp); 
