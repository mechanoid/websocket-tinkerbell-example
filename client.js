
class WebSocketConsole extends HTMLElement {
  constructor() {
    super()
    this.webSocket = new WebSocket('ws://localhost:443/');


  }
  connectedCallback() {
    this.playButton = button('PLAY')
    this.pauseButton = button('PAUSE')
    this.canvas = canvas()
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "blue";

    this.insertAdjacentElement('beforebegin', this.playButton)
    this.insertAdjacentElement('beforebegin', this.pauseButton)
    this.insertAdjacentElement('beforebegin', this.canvas)

    this.webSocket.onmessage = (event) => {
      const data = event.data.toString()
      try {
        const { x, y } = JSON.parse(data)
        drawDot(this.ctx, x, y)
      } catch(e) {
        console.log(data);
      }
    };

    this.playButton.addEventListener('click', () => {
      this.webSocket.send("PLAY");
    })

    this.pauseButton.addEventListener('click', () => {
      this.webSocket.send("PAUSE");
    })
  }
}

customElements.define('web-socket-console', WebSocketConsole)


function button(label) {
  const btn = document.createElement('button')
  btn.textContent = label
  return btn
}

function canvas() {
  const ctx = document.createElement('canvas')
  ctx.setAttribute('height', '500px')
  ctx.setAttribute('width', '500px')
  return ctx
}


function drawDot(ctx, x, y) {
  ctx.fillRect((x * 150) + 300,(y * 150) + 300, 1, 1);
}
