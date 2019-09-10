const aws = require('aws-sdk')
const ddb = new aws.DynamoDB.DocumentClient()
const tableName = process.env.tableName
const sentMessageFId = process.env.sentMessageFId
const updateExp = process.env.updateExp
const retValue = process.env.retValue
const expK = process.env.expK
const expV = process.env.expV

const getFlag = () => {
    return new Promise ((resolve, reject) => {
        ddb.get({
            TableName,
            Key : {
                SentMessageFlagId: sentMessageFId,
            }
        }, (err, data) => {
            if (err) reject(err, err.stack)
            else resolve(data)
        })
    })
}

const updateFlag = () => {
    return new Promise((resolve, reject) => {
        ddb.update({
            TableName,
            Key : {
                SentMessageFlagId: sentMessageFId
            },
            UpdateExpression : updateExp,
            ExpressionAttributeValues: {
                expK: expV
            },
            ReturnValues: retValue
        }, (err, data) => {
            if (err) reject(err, err.stack)
            else resolve(data)
        })

    })
}

exports.handler = async (event, context, callback) => {
    const r = await getFlag()
    if ('Item' in r && r.Item.SentMessageFlag) {
        const results = await updateFlag()
        await console.log(results)
    }
    await console.log(r)
}
