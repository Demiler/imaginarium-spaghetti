const ws = new WebSocket('ws://127.0.0.1:8081/');
 
ws.on('open', function open() {
  ws.send('something');
});
 
ws.on('message', function incoming(data) {
  console.log(data);
});
