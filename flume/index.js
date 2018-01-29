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

const _putMessage = (message) => {
  let params = {
    TableName: MESSAGE_TABLE,
    Item: {
      uuid: uuid(),
      timestamp: message.timestamp,
      message: message.message
    }
  }

  console.log(util.inspect(params, { depth: 5 }))
  return ddb.put(params).promise()
}

exports.handler = (event, context, callback) => {
  console.log(util.inspect(event, { depth: 5 }))

  _putMessage(event)
    .then( () => {
      callback(null, _buildResponse({ 'success': true }))
    })
    .catch( (error) => {
      console.error(error)
      callback(error)
    })
}
