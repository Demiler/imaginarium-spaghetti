import { Player } from './player.js'

export class Api {
  constructor() {
    this.calls = [];

    this.ws = new WebSocket('ws://127.0.0.1:8081/');
    this.ws.onopen = this.open;
    this.ws.onmessage = this.incoming;
  }

  open() {
    this.send(JSON.stringify({ 
      type: "newPlayer", 
      data: new Player("real player" + Math.random() * 100, "0.png", "ready", 0)
    }));
  }

  nothing(){}

  incoming(data) {
    let info = JSON.parse(data.data);
    this.calls.map(call => call.type === info.type ? callback(info.data) : nothing());
    console.log(this.calls);
  }

  on(type, callback) {
    console.log(this.calls);
    this.calls.push({type: type, callback: callback});
  }
}
