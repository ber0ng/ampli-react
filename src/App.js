import React, { useState, useEffect } from 'react';
//import logo from './logo.svg';
import './App.css';

import { Auth, Hub } from 'aws-amplify';

//variable
const initialFormState = {
  username: '', 
  password: '',
  email: '',
  authCode: '',
  formType: 'signUp'
}

function App() {
  const [formState, updateFormState] = useState(initialFormState)
  const [user, updateUser] = useState(null)
  useEffect (() => {
    checkUser()
    setAuthListener()
  }, [])
  
  async function setAuthListener() {
    Hub.listen('auth', (data) => {
  switch (data.payload.event) {
    case 'signOut':
        console.log('data from event:', data)
        updateFormState(() => ({ ...formState, formType: "signUp"}))
        break;
    default:
        break;
      }
    });
  }
  
  async function checkUser() {
    try {
      const user = await Auth.currentAuthenticatedUser()
      updateUser(user)
      console.log('user:', user)
      updateFormState(() => ({ ...formState, formType: "signedIn"}))
    }
    catch (err){
      
    }
  }
  
  //Create onchange handler & receive an events
  function onChange(e) {
    e.persist()
    updateFormState(() => ({ ...formState, [e.target.name]: e.target.value}))
  }
  
  //destructure the Formtype
  const { formType } = formState
  
  //create function to attach to the button
  async function signUp() {
    const { username, email, password } = formState
    await Auth.signUp({ username, password, attributes: { email }})
    updateFormState(() => ({ ...formState, formType: "confirmSignUp" }))
  }
  
  async function confirmSignUp() {
    const { username, authCode } = formState
    await Auth.confirmSignUp(username, authCode)
    updateFormState(() => ({ ...formState, formType: "signIn" }))
  }
  
  async function signIn() {
    const { username, password } = formState
    await Auth.signIn(username, password)
    updateFormState(() => ({ ...formState, formType: "signedIn" }))
  }
  
  return (
    <div className="App">
      {
        formType === 'signUp' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username" />
            <input name="password" type="password" onChange={onChange} placeholder="password" />
            <input name="email" onChange={onChange} placeholder="email" />
            <button onClick={signUp}>Sign Up</button>
            <button onClick= {() => updateFormState(() => ({
              ...formState, formType: "signIn"
            }))}>Sign In</button>
          </div>
        )
      }
      {
        formType === 'confirmSignUp' && (
          <div>
            <input name="authCode" onChange={onChange} placeholder="Confirmation code" />
            <button onClick={confirmSignUp}>Confirm Sign Up</button>
          </div>
        )
      }
      {
        formType === 'signIn' && (
          <div>
            <input name="username" onChange={onChange} placeholder="username" />
            <input name="password" type="password" onChange={onChange} placeholder="password" />
            <button onClick={signIn}>Sign In</button>
          </div>
        )
      }
      {
        formType === 'signedIn' && (
          <div>
            <h1>Hello world, welcome user.</h1>
            <button onClick= {
              () => Auth.signOut()
            }>Sign Out </button>
          </div>
        )
      }
    </div>
  );
}

export default App;
