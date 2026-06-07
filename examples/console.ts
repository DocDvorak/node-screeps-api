// If installed from npm, use:
// import { ScreepsHttpClient } from 'screeps-api'
import { ScreepsHttpClient } from '../src'
import readline from 'node:readline'
import util from 'node:util'

const input = process.stdin
const output = process.stdout
const rl = readline.createInterface({
  input,
  output,
  prompt: 'Screeps> '
})

const api = await ScreepsHttpClient.fromConfig('main')

function start () {
  return new Promise((_resolve, _reject) => {
    run()
    api.socket.on('connected', () => {
      console.log('start')
      rl.prompt()
    })
  })
}

function quit () {
  console.log('Bye')
  process.exit()
}

function run () {
  rl.on('line', (line) => {
    line = line.trim()
    if (line == 'exit') {
      quit()
    }
    api.userConsole(line)
  })

  rl.on('close', quit)

  api.on('message', (msg) => {
    console.log(msg)
    if (msg.slice(0, 7) == 'auth ok') {
      api.socket.subscribe('/console')
      console.log('Console connected')
    }
  })

  api.on('console', (msg) => {
    let [_user, data] = msg
    if (data.messages) data.messages.log.forEach((l: string) => console.log(l))
    if (data.messages) data.messages.results.forEach((l: string) => console.log('>', l))
    if (data.error) console.log(data.error.red)
  })
}

// Console fix
var fu = function (_type: unknown, args: unknown[]) {
  var t = Math.ceil((rl.line.length + 3) / process.stdout.columns)
  var text = util.format.apply(console, args)
  output.write('\n\x1B[' + t + 'A\x1B[0J')
  output.write(text + '\n')
  output.write(new Array(t).join('\n\x1B[E'))
}

console.log = function (...args: unknown[]) {
  fu('log', args)
}
console.warn = function (...args: unknown[]) {
  fu('warn', args)
}
console.info = function (...args: unknown[]) {
  fu('info', args)
}
console.error = function (...args: unknown[]) {
  fu('error', args)
}

start()
