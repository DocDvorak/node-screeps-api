// If installed from npm, use:
// import { ScreepsHttpClient } from 'screeps-api'
import { ScreepsHttpClient } from '../src'
import fs from 'node:fs/promises'

const api = await ScreepsHttpClient.fromConfig('main')

api.socket.on('message', (msg) => {
  // console.log('MSG', msg)
  if (msg.slice(0, 7) == 'auth ok') {
    api.socket.subscribe('/code')
  }
})

// Upload your code to trigger this.
api.on('code', async (msg) => {
  let [_user, data] = msg
  await fs.mkdir(data.branch)
  for (const moduleName in data.modules) {
    let file = `${data.branch}/${moduleName}.js`
    void fs.writeFile(file, data.modules[moduleName])
    console.log('Wrote', file)
  }
})
