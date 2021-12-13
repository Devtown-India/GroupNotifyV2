import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { RiSendPlaneLine } from 'react-icons/ri';
import FileUpload from './FileUpload';
import { TextareaAutosize } from '@mui/material';
import { v4 as uuid } from 'uuid';
import axios from 'axios'
import toast from 'react-hot-toast'
import { collection, addDoc } from "firebase/firestore";
import { db } from '../firebase/firebase'
import { useAuthState } from '../state/user'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function Message({ selectedGroups }) {
    const [open, setOpen] = React.useState(false);
    const [files, setFiles] = useState([])
    const [message, setMessage] = useState('')
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const authState = useAuthState()


    const randomString = num => {
        let res = '';
        for (let i = 0; i < num; i++) {
            const random = Math.floor(Math.random() * 27);
            res += String.fromCharCode(97 + random);
        };
        return res;
    };


    const handleMessage = async () => {

        let data

        if (files && files[0]) {
            const fData = new FormData()
            const filename = files[0].name
            const extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length) || filename

            var new_file = new File([files[0]], `${randomString(9)}.${extension}`);
            fData.append('file', new_file)
            try {
                await axios.post("http://localhost:8080/upload", fData)
                toast.success("File uploaded successfully")

                data = {
                    groups: selectedGroups,
                    isFile: true,
                    fileName: new_file.name,
                    message
                }
            } catch (error) {
                console.log(error)
                toast.error("error uploading file")
            }



        } else {
            data = {
                groups: selectedGroups,
                isFile: false,
                fileName: null,
                message,

            }
        }
        // add to history

        const docRef = await addDoc(collection(db, "history"), {
            ...data,
            email: authState.email.get(),
            time: new Date().toLocaleString()
        });


        const res = await axios.post('http://localhost:8080/sendMessage', data)
        setOpen(false)
        setFiles(null)


    }


    return (
        <div>
            <Button onClick={handleOpen} variant="contained" >
                <RiSendPlaneLine size={'20'} />
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography style={{ textAlign: 'center' }} id="modal-modal-title" variant="h6" component="h2">
                        Create Message
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <FileUpload files={files} setFiles={setFiles} />
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        <div>
                            <TextareaAutosize
                                onChange={e => { setMessage(e.target.value) }}
                                aria-label="minimum height"
                                minRows={20}
                                placeholder="Minimum 3 rows"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ textAlign: 'center' }} >
                            <Button onClick={() => { handleMessage() }} variant="outlined">Send Message</Button>
                        </div>
                    </Typography>
                </Box>
            </Modal>

        </div>
    );
}