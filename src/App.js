import React, { Component } from 'react'
//import logo from './logo.svg'

import SportSelect from './SportSelect.jsx'
import Disable from './Disable.jsx'
import { SignOut, withAuthenticator } from 'aws-amplify-react'

import { I18n } from 'aws-amplify'
import Amplify, { Auth } from 'aws-amplify'
import awsconfig from './aws-exports'
import aws from 'aws-sdk'
import ReactNotification from "react-notifications-component"
import "react-notifications-component/dist/theme.css"

aws.config.update({
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
    region: process.env.REACT_APP_REGION
})

Amplify.configure(awsconfig)

const poolId = process.env.REACT_APP_POOL_ID

/**I18n.setLanguage('en')
   const dict = {
   'en': {
   'Username': 'email'
   }
   }
   I18n.putVocabularies(dict)
*/
class App extends Component {
    state = {
        sports: [],
        user: null,
        disabled: false
    }
    notificationDOMRef = React.createRef()

    getUser = username => {
        return new Promise((resolve, reject) => {
            const cisp = new aws.CognitoIdentityServiceProvider()
            cisp.adminGetUser({
                Username:username,
                UserPoolId: poolId,
            }, (err, data) => {
                if (err)
                    reject(err, err.stack)
                else
                    resolve(data)
            })
        })
    }

    async componentDidMount() {
        let user
        try {
            user = await Auth.currentAuthenticatedUser()
        } catch (error) {
            console.log('there was an error: ', error)
        }
        
        const { attributes } = await user
        let sports = await []
        if ('custom:sports' in attributes && attributes['custom:sports']) {
            sports = await JSON.parse(attributes['custom:sports'])
        }
        let userData
        try {
            userData = await this.getUser(user.username)
        } catch (e) {
            await console.log('eee: ', e)
        }
        
        const hasSendNotif = userData.UserAttributes.filter(o => o.Name === 'custom:sendNotification')

        if (!hasSendNotif.length > 0) {
            try {
                await Auth.updateUserAttributes(user, {
                    'custom:sendNotification' : "1"
                })
            } catch (error) {
                console.log('epsilon: ', error)
            }
        }

        const enabled = hasSendNotif.length > 0  ? JSON.parse(hasSendNotif[0].Value)=== 1 : true
        await this.setState({sports, user, userEnabled: enabled, username: user.username})
    }

    onChange = selectedOption => {
        this.setState({sports: selectedOption})
    }

    toggle = disabled => {
        this.setState({userEnabled: disabled })
    }
    getUserSports = () => {
        return
    }
    onClick = async e => {
        await e.preventDefault()
        const { sports } = this.state
        const sportsFormat = this.state.sports.map(s => s.label).join(', ')
        if (sports && sports.length) {
            const user = await Auth.currentAuthenticatedUser()
            let params = {}
            params['custom:sports'] = await JSON.stringify(this.state.sports)
            try {
                let result = await Auth.updateUserAttributes(user, params)

            } catch (error) {
                await console.log('update user: ', error)
            }

            const message = {
                Message: `Hello! you've opted to subscribe to the following sports: ${sportsFormat}.`,
                PhoneNumber: user.attributes['phone_number']
            }

            try {
                let sns = await new aws.SNS()
                let send =  await sns.publish(message, async (error, data) => {
                    if (error) {
                        await console.log(error)
                    }
                })
            } catch (error) {
                await console.log('send msg: ', error)
            }
        }
        const successOrFail = sports && sports.length
        const notificationMessage = successOrFail ?`you've opted to suscribe to the following sports:${sportsFormat}!` : 'please select atleast one sports category.'
        const title = successOrFail ? 'Success!' : 'failure!'
        this.notificationDOMRef.current.addNotification({
            title: title,
            message: notificationMessage,
            type: successOrFail ? 'success' : 'danger',
            insert: 'top',
            container: 'top-center',
            animationIn: ['animated', 'fadeIn'],
            animationOut: ['animated', 'fadeOut'],
            dismiss: { duration: 5000},
            dismissable: { click: true }
        })
    }

    onKeyUp = e => {
        return e.currentTarget.value.replace(/[^\d+]/, '')
    }


    render() {
        const { sports, user, username, userEnabled } = this.state
        

        let submitButton
        if (userEnabled){
            submitButton = <button className="button is-primary" type="submit" onClick={this.onClick}> submit </button>
        } else {
            submitButton = <button disabled="true" className="button is-primary" type="submit" onClick={this.onClick}> submit </button>
        }
        return (
                <div className="App">
                <main>
                <section className="section">
                <div className="container">
                <div>
                <SignOut/>
                <Disable user={user} toggle={this.toggle} userEnabled={userEnabled} username={username}/>
                </div>
                <form>
                <div className="columns is-centered">
	            <div className="field column is-mobile is-one-quarter">
	            <label className="label">Sports</label>
	            <div className="control">
	            <div id="multiselect_component">
                <SportSelect value={sports} onChange={this.onChange}/>
                </div>
	            </div>
                </div>
                </div>
                <div className="columns is-centered">
	            <div className="field column is-mobile is-one-quarter is-grouped is-grouped-centered">
	            <div className="control">
                <ReactNotification ref={this.notificationDOMRef}/>
	            {submitButton}
	            <div id="average_temp"></div>
	            </div>
	            </div>
                </div>
                </form>
                </div>
                </section>
                </main>
                </div>
        )
    }
}


export default withAuthenticator(App, {
    signUpConfig: {
        hiddenDefaults: ['email']
    }
})








