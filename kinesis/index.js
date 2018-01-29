/**
 *
 *
 */

const util = require('util')
const uuid = require('uuid/v1')
const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient()

const MESSAGE_TABLE = (process.env.AWS_SAM_LOCAL) ? 'venturi-sample' : process.env.TABLE_NAME


AWS.config.update({ region: 'us-east-1' })

const _buildResponse = (statusCode, body) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json"
    }
  }
}

const _extractMessages = (event) => {
  return new Promise((resolve, reject) => {
    let messages = []

    event.Records.forEach((record) => {
      try {
        let message = Buffer.from(record.kinesis.data, 'base64').toString('utf8')
        let timestamp = record.kinesis.approximateArrivalTimestamp

        messages.push({ timestamp: timestamp, message: message })
      } catch (e) {
        reject(e)
      }
    })

    resolve(messages)
  })
}

const _putMessages = (messages) => {
  let params = {
    RequestItems: {}
  }

  let putRequests = messages.map((msg) => {
    return {
      PutRequest: {
        Item: {
          uuid: uuid(),
          timestamp: msg.timestamp,
          message: msg.message
        }
      }
    }
  })

  params.RequestItems[MESSAGE_TABLE] = putRequests
  console.log(console.log(util.inspect(params, { depth: 5 })))

  return ddb.batchWrite(params).promise()
}

exports.handler = (event, context, callback) => {
  // console.log(util.inspect(event, { depth: 5 }))

  _extractMessages(event)
    .then( (messages) => {
      return _putMessages(messages)    
    })
    .then( () => {
      callback(null, _buildResponse({ 'success': true }))
    })
    .catch( (error) => {
      console.error(error)
      callback(error)
    })
}