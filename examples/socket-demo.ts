// If installed from npm, use:
// import { ScreepsHttpClient } from 'screeps-api'
import { ScreepsHttpClient } from '../src'

try {
  // Setup
  const api = await ScreepsHttpClient.fromConfig('main')
  await api.socket.connect() // connect socket

  // Subscribe to 'cpu' endpoint and get events
  api.socket.subscribe('cpu')
  api.socket.on('cpu', (event) => {
    console.log(event.data.cpu) // cpu used last tick
  });

  // You can also put a callback to subscribe()
  api.socket.subscribe('console', (event) => {
    event.data.messages.log // List of console.log output for tick
  })
} catch(err) {
	console.log(err);
}
