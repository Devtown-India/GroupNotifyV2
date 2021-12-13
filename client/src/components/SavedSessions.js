
import { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Button } from '@mui/material';
import { collection, getDocs } from "firebase/firestore"
import { db } from '../firebase/firebase'
import { updateLoaderState } from '../state/loaderState';
import { Navigate, useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import NewSession from './NewSession';
import axios from 'axios';
import { updateSessionState } from '../state/session';
import { useAuthState } from '../state/user';
import { doc, deleteDoc } from "firebase/firestore";




export default function SavedSessions() {

    const [sessions, setSessions] = useState([])

    const getSessions = async () => {
        updateLoaderState({ loading: true })
        const querySnapshot = await getDocs(collection(db, "sessions"));
        let s = []
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            s = [...s, {
                id: doc.id,
                ...doc.data()
            }]
        });
        updateLoaderState({ loading: false })
        setSessions(s)

    }

    const authState = useAuthState()
    const navigate = useNavigate()
    useEffect(() => {
        if (authState.token.get() == null) navigate('/login')
        else getSessions()

    }, [])

    const resumeSession = async (session, sessionName) => {
        updateSessionState({ sessionName })
        const res = await axios.post('http://localhost:8080/initializeClient', { session: session })
        updateLoaderState({ loading: true })
        // console.log(JSON.parse(session))
    }

    const deleteSession = async (id) => {
        try {
            await deleteDoc(doc(db, "sessions", id));
            toast.success("Successfully deleted session")
            window.location.reload()
        } catch (error) {
            console.log(error.message)
            toast.error(error.message)

        }
    }


    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="caption table">
                <caption style={{ textAlign: "center" }} >
                    {sessions.length > 0 ? null : <div>No saved sessions... </div>}
                    <br />
                    <NewSession />
                </caption>
                <TableHead>
                    <TableRow>
                        <TableCell align='right'>Index</TableCell>
                        <TableCell align="right">Session Name</TableCell>
                        <TableCell align="right">Created At</TableCell>
                        <TableCell align="right">Total Participants</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sessions.map((session, iteration) => (
                        <TableRow key={session.id}>
                            <TableCell align="right">{iteration + 1}</TableCell>
                            <TableCell align="right">{session.sessionName}</TableCell>
                            <TableCell align="right">{session.createdAt}</TableCell>
                            <TableCell align="right">{session.totalParticipants}</TableCell>
                            <TableCell align="center">
                                <Button variant="outlined" onClick={() => { resumeSession(session.session, session.sessionName) }} color="success">Resume</Button> {' '}
                                <Button onClick={() => { deleteSession(session.sessionName) }} variant="outlined" color="error">
                                    Delete
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer >
    )

}
