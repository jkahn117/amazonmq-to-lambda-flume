/**
 *
 *
 */

const stomp = require('stompit')
const util = require('util')

///
const mqConnectParams = {
  host: process.env.HOST,
  port: Number(process.env.PORT),
  ssl: true,
  connectHeaders: {
    login: process.env.LOGIN,
    passcode: process.env.PASSCODE
  }
}

const buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  }
}

let consumed = false

exports.handler = (event, context, callback) => {
  // console.log(util.inspect(event, { depth: 5 }))

  stomp.connect(mqConnectParams, (error, client) => {

    if (error) {
      console.error("[Connect Error] " + error)
      callback({ message: error })
      return
    }

    let params = {
      destination: '/queue/test',
      ack: 'client-individual'
    }

    client.subscribe(params, (error, message) => {
      if (consumed) {
        return
      }

      let result = ''

      const read = function() {
        let chunk
        while(chunk = message.read()) {
          result += chunk
        }
      }

      message.on('readable', read)

      message.on('end', () => {
        callback(null, buildResponse(200, JSON.parse(result)))
        client.ack(message)
        client.disconnect()
      })
    })

  })
}