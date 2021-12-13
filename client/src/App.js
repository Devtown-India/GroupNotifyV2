import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import { createMuiTheme, createTheme } from '@mui/material'
import { ThemeProvider } from '@emotion/react'
import Layout from './layout/Layout'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import SavedSessions from './components/SavedSessions'
import Loader from './layout/Loader'
import { updateLoaderState, useLoaderState } from './state/loaderState'
import Login from './components/Login'
import toast, { Toaster } from 'react-hot-toast'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { updateAuthState } from './state/user'
import { log } from './logs/createLog'
import { updateSessionState, useSessionState } from './state/session'
import Session from './components/Session'
import { collection, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from './firebase/firebase'
import { useNavigate } from "react-router-dom";
import History from './components/History'
import Dm from './components/Dm'


const App = () => {

  const [qr, setqr] = useState(null)

  useEffect(() => {

    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // toast.success("U/ser logged in")

        updateAuthState({ token: user.accessToken, email: user.email })


      } else {
        // User is signed out
        // ...
        // toast("User logged out", {
        // icon: "⚠️"
        // })
        updateAuthState({ token: null, email: null })
      }
    });

  }, [])

  const sessionState = useSessionState()
  const navigate = useNavigate();


  useEffect(() => {
    const socket = io('ws://localhost:8080')

    socket.on('connnection', () => {
      console.log('connected to server');
    })

    socket.on('message', (message) => {
      console.log(message);
    })

    socket.on('disconnect', () => {
      toast.error("Client disconnected", {
        duration: 10000,
      })

      updateSessionState({ qr: null, isActive: false, activeSession: null, sessionLoading: false })
    })

    socket.on('qr', ({ qr }) => {
      toast.success("QR refreshed", {
        duration: 5000,
      })
      updateLoaderState({ loading: false })
      updateSessionState({ qr })
    })

    socket.on('job', ({ message, isFailed }) => {

      isFailed ? toast.error(message, {
        duration: 10000,
      }) : toast.success(message, {
        duration: 5000,
      })
    })

    socket.on('authenticated', async ({ session }) => {
      const sessionName = sessionState.sessionName.get()
      const docRef = doc(db, "sessions", sessionName);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        console.log("Session already exists, skipping save!!");
      } else {
        // doc.data() will be undefined in this case
        const sessionRef = collection(db, "sessions")
        await setDoc(doc(sessionRef, sessionName), { session, createdAt: new Date().toLocaleDateString(), sessionName });
        console.log("No such document!");
      }
      toast.success("Client authenticated", {
        duration: 5000,
      })
      // await setDoc(doc(ref, sessionState.session.get()), {
      //   session: JSON.stringify(session),
      //   createdAt: new Date().toLocaleDateString(),
      //   sessionName: sessionState.session.get()
      // });
      updateSessionState({ qr: null, isAuthenticated: true, })
    })

    socket.on('auth-failure', () => {
      toast.error("error auhenticating client", {
        duration: 10000,
      })
      updateLoaderState({ loading: false })
      updateSessionState({ qr: null, isAuthenticated: false, isReady: false, })
    })

    socket.on('client-ready', () => {
      toast.success("client ready.. Redirecting now", {
        duration: 5000,
      })
      navigate('/active')
      updateLoaderState({ loading: false })
      updateSessionState({ qr: null, isAuthenticated: true, isReady: true })
    })

  }, [])


  // const logoutClient = async () => {
  //   await axios.get('http://localhost:8080/logoutClient')
  // }

  // useEffect(() => {
  //   return () => logoutClient()
  // }, [])f

  const initializeClient = async () => {
    const res = await axios.get("http://localhost:8080/initializeClient")
    console.log(res.data)
  }

  const textCLient = async () => {
    const res = await axios.get("http://localhost:8080/testClient")
    console.log(res.data)
  }

  const theme = createTheme({
    palette: {
      type: 'dark',
      mode: 'light'
    },
  });

  const loaderState = useLoaderState()

  return (
    <div>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <ThemeProvider theme={theme}>
        {loaderState.loading.get() ? <Loader /> : null}
        <Layout >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/savedSessions" element={<SavedSessions />} />
            <Route path="/active" element={<Session />} />
            <Route path="/history" element={<History />} />
            <Route path="/dm" element={<Dm />} />
          </Routes>
        </Layout>
      </ThemeProvider>
      {/* 
      {qr && <QRCode value={qr} />}
      <button onClick={initializeClient}>Initilize</button>
      <button onClick={textCLient}>Test</button> */}
    </div>
  );
}

export default App;