import { Player } from './player.js'

function randInt() {
  return Math.trunc(Math.random() * 100);
}

export class Api {
  constructor() {
    this.handlers = new Map()

    this.on = (type, handler) => {
      if (!this.handlers.has(type)) this.handlers.set(type, [])
      this.handlers.get(type).push(handler)
    }

    this.send = (type, data) =>
      this.ws.send(JSON.stringify({ type, data }));

    this.ws = new WebSocket('ws://127.0.0.1:8081/');
    this.ws.onopen = this.open;
    this.ws.onmessage = (data) => this.incoming(data);
  }

  open() {
    this.send(JSON.stringify({ 
      type: "newPlayer", 
      data: new Player("real player " + randInt(), "0.png", "notReady", 0),
    }));
  }

  incoming(data) {
    console.log(data);
    let info = JSON.parse(data.data);
    this.handlers.get(info.type)[0](info.data);
  }
}
