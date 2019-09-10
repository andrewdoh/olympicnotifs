const request = require('request-promise-native')
const jsdom = require('jsdom')
const { JSDOM } = jsdom

const aws = require('aws-sdk')
const ddb = new aws.DynamoDB.DocumentClient()

const poolId = process.env.poolId
const tableName = process.env.tableName
const updateExp = process.env.updateExp
const returnValues = process.env.returnValues
const queryAttributeOne = process.env.queryAttributeOne
const queryAttributeTwo = process.env.queryAttributeTwo
const updateVariable = process.env.updateVariable
const updateValue = process.env.updateValue

const cognitoIdentityServiceProvider = new aws.CognitoIdentityServiceProvider()

const tPromise = () => {
    return new Promise((resolve, reject)=> {
        cognitoIdentityServiceProvider.listUsers({
            UserPoolId: poolId,
        }, (err, data) => {
            if (err) reject(err, err.stack) // an error occurred
            else resolve(data.Users)           // successful response
        })
    })
}

const getUser = username => {
    return new Promise((resolve, reject)=> {
        cognitoIdentityServiceProvider.adminGetUser({
            UserPoolId: poolId,
            Username: username
        }, (err, data)=> {
            if (err) reject(err, err.stack)
            else resolve(data)
        })
    })
}
const getFlag = () => {
    return new Promise ((resolve, reject) => {
        ddb.get({
            TableName: tableName,
            Key : {
                SentMessageFlagId: 0,
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
            TableName: tableName,
            Key : {
                SentMessageFlagId: 0
            },
            UpdateExpression : updateExp,
            ExpressionAttributeValues: {
                updateVariable: updateValue
            },
            ReturnValues: returnValues
        }, (err, data) => {
            if (err) reject(err, err.stack)
            else resolve(data)
        })

    })
}


exports.handler = async (event, context) => {
    // grab all users and begin sifting through the categories selected
    let users
    try {
        users = await tPromise()

    } catch (error) {
        await console.log(error)
    }

    const actualUsers = await Promise.all(users.map(async user => {
        try {
            return await getUser(user.Username)
        } catch (error) {
            throw error
        }
    }))

    const usersWithSports = actualUsers.filter(u => u.UserAttributes.filter(o => o.Name === queryAttributeOne).length > 0)
    //await console.log('actual users: ', actualUsers.forEach(au => console.log(au.UserAttributes)))
    let activeCats = {}
    let sportCats = usersWithSports.forEach(u => {
        const customSports = u.UserAttributes.filter(o => o.Name === queryAttributeOne)
        if (customSports && customSports.length > 0) {
            let cs = JSON.parse(customSports[0].Value)
            cs.forEach(s => {
                if(!(s.value in activeCats))
                    activeCats[s.value] = s.label
            })
        }
    })

    //filter through users and collect categories taking note of which users are associated to which categories
    const requestedCats = Object.entries(activeCats)
    // making the requests to the categories
    let ticketsAvailable = []
    for (const [sportId, sportName] of requestedCats) {
        // when the static page is setup and db get sports subscribed to
        try {
            const req = await request.get(`https://www.cosport.com/olympics/ticketsessiondetail.aspx?sportId=${sportId}&excludesoldout=False`)

            const dom = await new JSDOM(req)
            const cats = await dom.window.document.getElementsByClassName('categories-list')

            for (cat of cats) {
                const soldOut = await cat.textContent.includes('Sold Out')
                if (!soldOut && !ticketsAvailable.includes(sportId)) {
                    ticketsAvailable.push(sportId)
                }
            }

        } catch (error) {
            await console.log(error)
        }
    }

    const messageSent = await getFlag()
    if (!messageSent.Item.SentMessageFlag) {
        for (user of usersWithSports) {
            const cs = user.UserAttributes.filter(o => o.Name === queryAttributeOne)
            const sendNotifs = user.UserAttributes.filter(o => o.Name === queryAttributeTwo)
            if (cs && cs.length > 0 && sendNotifs && sendNotifs.length > 0 && JSON.parse(sendNotifs[0].Value) === 1) {
                let userSportsAvail = []
                const userSports = JSON.parse(cs[0].Value)
                for (us of userSports) {
                    if(ticketsAvailable.includes(us.value))
                        userSportsAvail.push(us.label)
                }

                const parsedSports = userSportsAvail.join(', ')
                const userPhoneNumber = user.UserAttributes.filter(o => o.Name === queryAttributeTwo)[0].Value
                const message = {
                    Message: `tickets available for the following categories:${parsedSports}!`,
                    PhoneNumber: userPhoneNumber
                }
                if (user.UserAttributes.Enabled && parsedSports && parsedSports.length > 0) {
                    let sns = await new aws.SNS()
                    let send =  await sns.publish(message, async (error, data) => {
                        if (error) {
                            await console.log(error)
                        } else {
                            await console.log('message', data)
                            await context.succeed(null, data)
                        }
                    })
                }
            }
        }
    }
    if (ticketsAvailable && ticketsAvailable.length > 0) {
        await updateFlag()
    }
}










