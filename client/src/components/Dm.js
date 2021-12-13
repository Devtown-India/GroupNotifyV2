// import { useEffect, useState } from "react";
// import axios from 'axios'

// const Dm = () => {

// const getChats = async () => {
//     const res = await axios.get('http://localhost:8080/getChats')
//     console.log(res.data)
// }

//     useEffect(() => {
//         getChats()
//     }, [])

//     return (
//         <div>
//             <div>
//                 lorem

//             </div>
//         </div>
//     );
// }

// export default Dm;



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
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Chat from './Chat'
import Message from './Message';



export default function Dm() {

    const [chats, setChats] = useState([])

    const authState = useAuthState()
    const navigate = useNavigate()

    const getChats = async () => {
        updateLoaderState({ loading: true })
        const res = await axios.get('http://localhost:8080/getChats')
        console.log(res.data)
        updateLoaderState({ loading: false })
        setChats(res.data.messages)
    }

    useEffect(() => {
        if (authState.token.get() == null) navigate('/login')
        else getChats()

    }, [])
    console.log(chats)
    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="caption table">

                <TableHead>
                    <TableRow>
                        <TableCell align='right'>Index</TableCell>
                        <TableCell align="left">Name</TableCell>
                        <TableCell align="left">message</TableCell>
                        <TableCell align="right">Date</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>

                    {chats && chats.map((c, iteration) => {
                        const { messages, chat } = c
                        const message = messages[messages.length - 1]
                        console.log(chat, messages)
                        return (
                            <TableRow key='sd'>
                                <TableCell align="right">{iteration + 1}</TableCell>
                                <TableCell align="left">{chat.name}</TableCell>
                                <TableCell align="left">{message.body.substring(0, 50)}</TableCell>
                                <TableCell align="right">{new Date(message.timestamp * 1000).toLocaleDateString()}</TableCell>
                                <TableCell style={{ display: "flex" }} align="center">
                                    <View messages={messages} />
                                    {' '} &nbsp;
                                    <Message selectedGroups={[chat.id._serialized]} />
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </TableContainer >
    )

}



function View({ messages }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);


    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        height: 500,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div>
            <Button onClick={handleOpen} variant="outlined" color="primary">View Chat</Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} >
                    <Chat messages={messages} />
                </Box>
            </Modal>
        </div>
    );
}