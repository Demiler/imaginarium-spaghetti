import { LitElement, html } from 'lit-element'; 
import { Player } from './player.js';
import { sleep } from './functions.js';
import { Api } from './api.js'
//import { sleep, shuffle } from  './functions.js';

 
let players = [];
//players.push(new Player("you", "0.png", "notReady", 0));
players.push(new Player("player1", "0.png", "notReady", 0));
//players.push(new Player("player2", "0.png", "ready", 0));
//players.push(new Player("player3", "0.png", "ready", 0));
let api = new Api();

class ImApp extends LitElement {
  static get properties() {
    return {
      state: { type: String }, //defines current application render and behavior
      players: { type: Array }, //all players array
      host: { type: Player },   //this session player
      lobbyBtn: { type: Boolean }, //switcher for lobby ready button
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
    api.on('newPlayer', (player) => { 
      //api.send('newPlayerUpdate', this.players);
      const pl = Player.fromJSON(player);
      this.players.push(Player.fromJSON(player));
      this.requestUpdate();
    });
    
    this.host = players[0];
    this.lobbyBtn = false;
    this.checkLock = false;
    this.leaderGuess = "";
    this.state = 'lobby';
    //this.state = "game guess";this.initGameGuess();
    //this.state = 'game turn';this.initGameTurn(this.host, "what ever");
    //this.state = 'game think';this.initGameThink();
  }

  render() {
    switch (this.state) {
      case 'lobby': this.lobbyChecker(); return this.lobby(); break;
      case 'game guess': return this.gameGuess(); break;
      case 'game wait': return this.gameWait(); break;
      case 'game turn': this.gameTurnChecker(); return this.gameTurn(); break;
      case 'game think': return this.gameThink(); break;
      default: return html`not found`; 
    }
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

  initGameThink() {
  }

  gameThink() {
    return html`
    <div class="gameContainer">
      ${this.gameDrawSidebar()}
    </div>
    `;
  }

  initGameGuess() {
    if (this.initLock === true) return;
    this.initLock = true;
    this.gameQueue = this.players.slice();
    //shuffle(this.gameQueue);
    this.gameQueue.map(player => player.status = 'waiting');
    this.gameLeaderId = 0;
    this.gameLeader = this.gameQueue[0];
    this.state = this.gameLeader === this.host ? 'game guess' : 'game wait';
    this.gameLeader.status = 'guessing';
    this.hostCards = [ "card0.jpeg", "card1.jpeg", "card2.jpeg", "card3.jpeg",
                       "card4.jpeg", "card5.jpeg"];
    this.leaderGuess = '';
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
    await sleep(500);
    this.players[3].status = 'waiting';
    this.requestUpdate()

    await sleep(500);
    this.players[1].status = 'waiting';
    this.requestUpdate()

    await sleep(1000);
    this.players[2].status = 'waiting';
    this.requestUpdate()
  }

  initGameTurn(gameLeader, leaderGuess) {
    this.gameLeader = gameLeader;
    this.leaderGuess = leaderGuess;
    this.players.map(player => player.status = 'picking');
    this.gameLeader.status = 'waiting';

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

  gameWait() {
    return html`
    uh oh
      <div class="leader">
        <div class="leaderWrap">
          <img class="leaderImage" src="../img/avatars/${this.gameLeader.icon}">
          <span class="leaderName">${this.gameLeader.name}</span>
          <span class="playerScore">${this.gameLeader.score}</span>
        </div>
        <span class="leaderGuess ${this.gameLeader.status}">${this.gameLeader.status}</span>
      </div>

    `;
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
    this.initGameGuess();
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
    this.host.status = this.host.status === "ready" ? "notReady" : "ready";
    //if delete this meaningless line of code nothing is gonna work/update.
    this.lobbyBtn = !this.lobbyBtn; 
    if (this.players.filter(player => player.status === 'notReady').length === 0)
      this.initGameGuess();
  }

  createRenderRoot() { return this }
}

customElements.define('im-app', ImApp); 
