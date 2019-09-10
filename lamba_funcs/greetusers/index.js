const aws = require('aws-sdk')

const topicArn = process.env.topicArn 
let params = {
    Message: "Welcome! if you\'re seeing this message then you\'ve been confirmed. Please go on ahead and select the sports you\'d like to be notified about and once they\'re available we\'ll notify you asap.",
}

let userParams = {
    Protocol: 'sms',
    TopicArn: topicArn
    
}
exports.handler =  (event, context, callback) => {
    // Create promise and SNS service object
    let sns = new aws.SNS()
    console.log('e: ', event)
    userParams.Endpoint = event.request.userAttributes['phone_number']
    let subscribeUserPromise = sns.subscribe(userParams).promise()
    subscribeUserPromise.then(
        data => {
            console.log("Subscription ARN is " + data.SubscriptionArn);
        }).catch(
            err => {
                console.error(err, err.stack);
            })
    params.PhoneNumber = event.request.userAttributes['phone_number']
    let publishTextPromise = sns.publish(params).promise()
    // Handle promise's fulfilled/rejected states
    publishTextPromise.then(
        data => {
            console.log("Message ${params.Message} send sent to the topic ${params.TopicArn}")
            console.log("MessageID is " + data.MessageId)
        }).catch(
            err => {
                console.error(err, err.stack)
            })
    callback(null, event)
}
