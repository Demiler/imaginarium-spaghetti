import { LitElement, html } from 'lit-element'; 

let playersCounter = 0;

//class Player extends LitElement {
class Player {
  static get properties() {
    return {
      name: { type: String },
      icon: { type: String },
      status: { type: String },
      score: { type: Number }
    };
  }
  constructor() {
    //super();
    playersCounter++;
    this.name = "player" + playersCounter;
    this.icon = "0.png";
    this.status = "";
    this.score = 0;
  }
  //createRenderRoot() { return this }
}

class Players extends LitElement {
  static get properties() {
    return {
      players: { type: Array }
    };
  }

  constructor() {
    super();
    this.players = [];
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
      btn: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.name = "lobby";
    this.over = { pList: new Players(), btnState: false };
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
            ${this.over.pList.players.filter(player => player.state === "ready").length}
          </span>/<span class="total">
            ${this.over.pList.players.length}
          </span>
        </div>

        <button class="readyButton ${this.btn ? "ready" : "notReady"}"
        @click="${this.readyButton}">
          ${this.btn ? "not ready" : "ready"}
        </button>
      </div>
    `;
  }

  readyButton() {
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
