import { Player } from './player.js'

function randInt() {
  return Math.trunc(Math.random() * 100);
}

export class Api {
  constructor() {
    this.client = new Player
      ("real player " + randInt(), "0.png", "notReady", 0);
    this.handlers = new Map()

    this.on = (type, handler) => {
      if (!this.handlers.has(type)) this.handlers.set(type, [])
      this.handlers.get(type).push(handler)
    }

    this.send = (type, data) =>
      this.ws.send(JSON.stringify({ type, data }));

    this.ws = new WebSocket('ws://127.0.0.1:8081/');
    this.ws.onopen = (event) => this.open();
    this.ws.onclose = (event) => this.close();
    this.ws.onmessage = (data) => this.incoming(data);
  }

  close() {
    this.send('removePlayer', this.client);
  }

  open() {
    this.send('newPlayer', this.client);
  }

  incoming(data) {
    console.log(data);
    let info = JSON.parse(data.data);
    this.handlers.get(info.type)[0](info.data);
  }
}
