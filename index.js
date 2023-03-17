import {resolve} from 'path'
import {  Readable } from 'stream'
import { WebSocketServer}from 'ws'
import express from 'express'
import morgan from 'morgan'

const app = express()
const sockserver = new WebSocketServer({ port: 443 })

app.use(morgan('combined'))
app.use('/client.js', express.static('./client.js'))

app.get('/', (_req, res, next) => {
  return  res.sendFile(resolve(process.cwd(), 'index.html'))
})

app.get('/other', (_req, res, next) => {
  return  res.send(`hi there! See this number ${Math.random() * 1_000_000_000_000} ?`)
})

sockserver.on('connection', ws => {
  let pause = false
  console.log('New client connected!')
  ws.send('connection established')
  ws.on('close', () => console.log('Client has disconnected!'))


  ws.on('message', data => {
    const msg = data.toString()
    console.log(msg);
    if (msg === "PAUSE") {
      pause = true
      console.log('Pause the Stream');
    } else if (msg === "PLAY") {
      pause = false
      console.log('Start the Stream');
    }
  })

  readTinkerbellStream((coords) => {
    if (!pause){
      ws.send(coords.toString())
    }
  })

  ws.onerror = function () {
    console.log('websocket error')
  }
 })


export default config => {
  return app
}



// *******************************************************
// STREAM
// *******************************************************

function readTinkerbellStream(onRead) {
  const stream = new TinkerBellStream()
  stream.on('data', onRead)
  stream.on('close', () => console.log('stream closed!'))
}


function* tinkerBellGenerator() {
	let x = -0.7
  let y = -0.6

  while (true) {
  	const newX = tinkerBellX(x, y)
    const newY = tinkerBellY(x, y)
		x = newX
    y = newY

		yield ({ x, y })
  }
}


function tinkerBellX(x,y) {
  return Math.pow(x, 2) - Math.pow(y, 2) + (0.9 * x) - (0.6 * y)
}

function tinkerBellY(x,y) {
  return (2 * x * y) + (2 * x) + (0.5 * y)
}


class TinkerBellStream extends Readable {
  constructor(opts) {
    super(opts)
    this.x = -0.7
    this.y = -0.6
    this.gen = tinkerBellGenerator()
  }

  _read() {
    setTimeout(() => this.push(JSON.stringify(this.gen.next().value)), 0)
  }
}
