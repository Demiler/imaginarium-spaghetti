import { LitElement, html } from 'lit-element'; 

class Player {
  static get properties() {
    return {
      name: { type: String },
      icon: { type: String },
      status: { type: String },
      score: { type: Number }
    };
  }

  constructor(name, icon, status, score) {
    this.name = name;
    this.icon = icon;
    this.status = status;
    this.score = score;
  }
}

let players = [];
players.push(new Player("you", "0.png", "notReady", 0));
players.push(new Player("player1", "0.png", "ready", 0));
players.push(new Player("player2", "0.png", "ready", 0));
players.push(new Player("player3", "0.png", "ready", 0));

function sleep(ms) {
  return new Promise(
    resolve => setTimeout(resolve, ms)
  );
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class ImApp extends LitElement {
  static get properties() {
    return {
      state: { type: String },
      players: { type: Array },
      host: { type: Player },
      lobbyBtn: { type: Boolean },
      checkLock: { type: Boolean },
      gameLeader: { type: Player },
      gameLeaderId: { type: Number },
      gameQueue: { type: Array },
      hostCards: { type: Array },
    };
  }

  constructor() {
    super();
    this.players = players;
    this.host = players[0];
    this.lobbyBtn = false;
    this.checkLock = false;
    //this.state = "game guess";this.initGame();
    this.state = 'lobby';
  }

  render() {
    switch (this.state) {
      case 'lobby': this.lobbyChecker(); return this.lobby(); break;
      case 'game guess': this.gameChecker(); return this.gameGuess(); break;
      case 'game wait': this.gameChecker(); return this.gameWait(); break;
      default: return html`not found`; 
    }
  }

  async gameChecker() {
  }

  initGame() {
    this.gameQueue = this.players.slice();
    //shuffle(this.gameQueue);
    this.gameQueue.map(player => player.status = 'waiting');
    this.gameLeaderId = 0;
    this.gameLeader = this.gameQueue[0];
    this.state = this.gameLeader === this.host ? 'game guess' : 'game wait';
    this.gameLeader.status = 'guessing';
    this.hostCards = [ "card0.jpeg", "card1.jpeg", "card2.jpeg", "card3.jpeg",
                       "card4.jpeg", "card5.jpeg"];
  }

  gameGuess() {
    return html`
    <div class="gameContainer">
      <div class="sidebar">
        <div class="playerList">
          ${this.players.filter(player => player !== this.gameLeader).map(player => html`
            <div class="player ${player.status}">
              <img class="playerImage" src="../images/avatars/${player.icon}">
              <div class="playerSnN">
                <div class="playerName">${player.name}</div>
                <div class="playerStatus">${player.status}</div>
              </div>
              <span class="playerScore">${player.score}</span>
            </div>
          `)}
        </div>
      </div>

      <div class="leader">
        <div class="leaderWrap">
          <img class="leaderImage" src="../images/avatars/${this.gameLeader.icon}">
          <span class="leaderName">${this.gameLeader.name}</span>
          <span class="playerScore">${this.gameLeader.score}</span>
        </div>
        <span class="spacer">:</span>
        <span class="leaderGuess ${this.gameLeader.status}">${this.gameLeader.status}</span>
      </div>

      <div class="cardsContainer">
        ${this.hostCards.map(card => html`
          <div class="card">
            <img class="cardImage" src="../images/cards/${card}">
          </div>
        `)}
      </div>
    </div>
    `;
  }

  gameWait() {
    return html`
    uh oh
    `;
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
              <img class="playerImage" src="../images/avatars/${player.icon}">
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
    this.lobbyBtn = !this.lobbyBtn;
  }

  createRenderRoot() { return this }
}

customElements.define('im-app', ImApp); 
