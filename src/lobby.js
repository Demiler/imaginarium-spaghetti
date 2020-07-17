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

class Players extends LitElement {
  static get properties() {
    return {
      players: { type: Array } //host player is always first
    };
  }

  constructor() {
    super();
    this.players = players;
  }

  render() {
    return html`
    ${this.players.map(player => html`
      <div class="player ${player.status}">
        <img class="playerImage" src="../images/avatars/${player.icon}">
        <div class="playerName">${player.name}</div>
      </div>
    `)}
    `;
  }

  createRenderRoot() { return this }
}

class Lobby extends LitElement {
  static get properties() {
    return {
      name: { type: String },
      over: { type: Object },
      host: { type: Object },
      btn: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.name = "lobby";
    this.over = { pList: new Players(), btnState: false };
    this.host = players[0];
    this.btn = false;
  }

  render() {
    return html`
      <header>
        <span class="nameTag">Imaginarium</span>
        <span class="settings">Settings</span>
        <span class="sound">Sound: On</span>
      </header>
  
      <div class="container">
        <h1>List of players</h1>

        <im-players class="playerList"></im-players>
        <div class="playerCounter">
          <span class="ready">
            ${this.over.pList.players.filter(player => player.status === "ready").length}
          </span>/<span class="total">
            ${this.over.pList.players.length}
          </span>
        </div>

        <button class="readyButton ${this.host.status}"
        @click="${this.readyButton}">
          ${this.host.status === "ready" ? "not ready" : "ready"}
        </button>
      </div>
    `;
  }

  readyButton() {
    this.host.status = (this.host.status === "ready" ? "notReady" : "ready");
    this.btn = !this.btn;
  }

  createRenderRoot() { return this }
}

class ImApp extends LitElement {
  static get properties() {
    return {
      state: { type: String },
      player: { type: Object }
    };
  }

  constructor() {
    super();
    this.player = new Player();
    this.player.name = "You";
    this.state = "lobby"
  }

  render() {
    return html`<im-lobby></im-lobby>`;
  }

  createRenderRoot() { return this }
}

customElements.define('im-app', ImApp); 
customElements.define('im-lobby', Lobby); 
customElements.define('im-players', Players); 
//customElements.define('im-player', ); //
