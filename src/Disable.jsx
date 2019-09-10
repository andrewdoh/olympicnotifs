import React, { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
const aws = require('aws-sdk')



const Disable = props => {
    const [disabled, setDisabled] = useState(!props.userEnabled)
    const cisp = new aws.CognitoIdentityServiceProvider()

    useEffect(()=> {
        setDisabled(!props.userEnabled)
    }, [props.userEnabled])

    const disableUser = async () => {
        try {
            await Auth.updateUserAttributes(props.user, {
                'custom:sendNotification' : "0"
            })
        } catch (error) {
            console.log('epsilon: ', error)
        }
        setDisabled(true)
        props.toggle(false)
    }

    const enableUser = async () => {
        try {
            await Auth.updateUserAttributes(props.user, {
                'custom:sendNotification' : "1"
            })
        } catch (error) {
            console.log('epsilon: ', error)
        }
        setDisabled(false)
        props.toggle(true)
    }

    const toggleUser = () => {
        disabled ? enableUser() : disableUser()
    }

    const doe = disabled ? 'Enable' : 'Disable'
    return (
        <button style={{left: '5%'}}className='button is-warning' onClick={toggleUser}>{doe} Account</button>
    )
}

export default Disable
