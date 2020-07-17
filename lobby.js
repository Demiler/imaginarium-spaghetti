import { LitElement, html } from 'lit-element'; 

let playersCounter = 0;

//class Player extends LitElements {
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
    let name = "player" + playersCounter;
    let icon = "";
    let status = "";
    let score = 0;
  }
  //createRenderRoot() { return this }
}

class Players extends LitElements {
  static get properties() {
    return {
      players: { type: Array }
    };
  }

  constructor() {
    super();
    let players = [];
    players.push(new Player());
  }

  render() {
    return html`
    <div class="playerList">
      ${this.players.map(player => html`
        <div class="player ${player.status}">
          <!--<img class="playerImage" src="img/avatars/${player.icon}">-->
          <div class="playerName">${player.name}</div>
        </div>
      `)}
    </div>
    `;
  }

  createRenderRoot() { return this }
}

class Lobby extends LitElements {
  static get properties() {
    return {
      name: { type: String }
      over: { type: Object }
      btn: { type: Boolean }
    };
  }

  constructor() {
    const name = "lobby";
    let over = { pList: new Players(), btnState: false };
    let btn = false;
  }

  render() {
    return html`
      <im-players></im-players>
      <div class="playerCounter">
        <span class="ready">
          ${this.over.pList.filter(player => player.state === "ready").length()}
        </span>
        <span class="total">
          ${this.over.pList.length()}
        </span>
      </div>

      <button
        @click="${this.readyButton}">
        ${if (this.btn) return html`not ready`;
          else return html`ready`;}
      </button>
    `;
  }

  readyButton() {
    btn = !btn;
  }

  createRenderRoot() { return this }
}

class ImApp extends LitElements {
  static get properties() {
    return {
      state: { type: Object }
    };
  }

  constructor() {
    super();
    let state = new Lobby();
  }

  render() {
    return this.state;
  }

  createRenderRoot() { return this }
}

customElements.define('im-app', ImApp); 
customElements.define('im-lobby', Lobby); 
customElements.define('im-players', Players); 
//customElements.define('im-player', ); //
