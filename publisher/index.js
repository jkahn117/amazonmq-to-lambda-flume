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
      'content-type': 'application/json'
    }

    let frame = client.send(params)

    frame.end(event.body)

    client.disconnect( (error) => {
      if (error) {
        console.error("[Disccount Error] " + error)
      }

      callback(null, buildResponse(200, { message: 'Success!' }))
    })

  })
}