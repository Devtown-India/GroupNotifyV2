import { Button, Modal, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState, useEffect } from 'react'
import axios from 'axios'
import QRCode from 'react-qr-code';
import { updateSessionState, useSessionState } from "../state/session";
import { Navigate } from "react-router";
import { updateLoaderState } from "../state/loaderState";
import toast from "react-hot-toast";



const NewSession = () => {
    const [open, setopen] = useState(false)
    const initializeClient = async () => {
        const res = await axios.post('http://localhost:8080/initializeClient', { session: null })
    }

    const destroyClient = async () => {
        const res = await axios.get('http://localhost:8080/destroy')

    }

    useEffect(() => {

        return () => console.log("unmounting the component")
    }, [])


    const sessionState = useSessionState()

    const isAuthenticated = sessionState.isAuthenticated.get()
    const isReady = sessionState.isReady.get()

    const handleNewSession = async () => {
        updateLoaderState({ loading: true })
        const name = window.prompt("Enter session's name") || ""
        if (name.length > 5) {
            updateSessionState({ sessionName: name })
            setopen(prev => !prev)
            await initializeClient()
        } else {
            updateLoaderState({ loading: false })
            toast.error("Invalid session name")
        }

    }

    const handleClose = async () => {

        setopen(false)

        if (!isAuthenticated || !isReady) {
            updateSessionState({ qr: null })
            updateLoaderState({ loading: false })
            const res = await axios.get('http://localhost:8080/destroy')
        }

    }

    return <div>
        <Button onClick={() => { handleNewSession() }} variant="contained" color="primary">
            New Session
        </Button>
        <Modal
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box style={{ background: "#fff", width: '40%', height: '400px', display: 'flex', flexDirection: "column", alignItems: 'center', justifyContent: 'center' }}>
                <Typography style={{ textAlign: "center" }} id="modal-modal-title" variant="h6" component="h2">
                    Scan QR to get started
                </Typography>
                {sessionState.qr.get() && <QRCode value={sessionState.qr.get()} />}

            </Box>
        </Modal>
    </div >
}

export default NewSession;