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
players.push(new Player("player2", "0.png", "notReady", 0));
players.push(new Player("player3", "0.png", "notReady", 0));

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
    };
  }

  constructor() {
    super();
    this.state = "lobby";
    this.players = players;
    this.host = players[0];
    this.lobbyBtn = false;
    this.lobbyLock = false;
  }

  render() {
    switch (this.state) {
      case 'lobby': this.lobbyChecker(); return this.lobby(); break;
      default: return html`not found`; 
    }
  }

  async gameChecker() {
  }

  initGame() {
    this.gameQueue = shuffle(this.players);
    this.gameLeaderId = 0;
    this.gameLeader = this.gameQueue[0];
    this.state = this.gameLeader === this.host ? 'game guess' : 'game wait';
  }

  async lobbyChecker() {
    if (this.checkLock === true) return;
    this.lobbyLock = true;
    while (
      this.players.filter(player => player.status === 'notReady').length !== 0
    ) await sleep(1000);
    initGame();
    this.checkLock = false;
  }

  lobby() {
    return html`
      <header>
        <span class="nameTag">Imaginarium</span>
        <span class="settings">Settings</span>
        <span class="sound">Sound: On</span>
      </header>
  
      <div class="container">
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
