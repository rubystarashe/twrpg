export default defineNuxtPlugin(nuxt => {

  const nonce = () => {
    let uuid = ''
    for (let i = 0; i < 32; i += 1) {
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-'
      }
      let n
      if (i === 12) {
        n = 4
      } else {
        const random = Math.random() * 16 | 0
        if (i === 16) {
          n = (random & 3) | 0
        } else {
          n = random
        }
      }
      uuid += n.toString(16)
    }
    return uuid
  }

  let tries = 0
  const connect = async () => {
    console.log('trying')
    const port = 6463 + (tries % 10)
    tries += 1

    const ws = new WebSocket(
      `ws://127.0.0.1:${port}/?v=1&client_id=1016279948337610772&encoding=json`
    )
    ws.onmessage = (event) => {
      console.log(event)
    }
    ws.onopen = () => {
      tries = 0
      console.log(ws)

      // ws.send(
      //   JSON.stringify({
      //     nonce: nonce(),
      //     args: {
      //       client_id: "1016252391777108010",
      //       scopes: ["rpc"]
      //     },
      //     cmd: "AUTHORIZE"
      //   }
      // ))
    }
    ws.onerror = e => {
      ws.close()
      setTimeout(() => connect(), 1000)
    }
  }
  connect()
})
