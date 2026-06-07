// If installed from npm, use:
// import { ScreepsHttpClient } from 'screeps-api'
import { ScreepsHttpClient } from '../src'
import fs from 'node:fs'

const api = await ScreepsHttpClient.fromConfig('main', {
  client: {
    defaultShard: 'shard0'
  }
})
const memory = await api.userMemoryGet()
fs.writeFileSync('memory.json', JSON.stringify(memory))
