
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import {
    DataGrid,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
} from '@mui/x-data-grid';
import { useDemoData } from '@mui/x-data-grid-generator';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios'
import { updateLoaderState } from '../state/loaderState';
import Button from '@mui/material/Button';
import { RiSendPlaneLine } from "react-icons/ri";
import Message from './Message';
import { useSessionState } from '../state/session';
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuthState } from '../state/user';
import { useNavigate } from 'react-router';
import { toast } from 'react-hot-toast'



function escapeRegExp(value) {
    return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function QuickSearchToolbar(props) {
    return (
        <Box
            sx={{
                p: 0.5,
                pb: 0,
                justifyContent: 'space-between',
                display: 'flex',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
            }}
        >

            <TextField
                variant="standard"
                value={props.value}
                onChange={props.onChange}
                placeholder="Search…"
                InputProps={{
                    startAdornment: <SearchIcon fontSize="small" />,
                    endAdornment: (
                        <IconButton
                            title="Clear"
                            aria-label="Clear"
                            size="small"
                            style={{ visibility: props.value ? 'visible' : 'hidden' }}
                            onClick={props.clearSearch}
                        >
                            <ClearIcon fontSize="small" />
                        </IconButton>
                    ),
                }}
                sx={{
                    width: {
                        xs: 1,
                        sm: 'auto',
                    },
                    m: (theme) => theme.spacing(1, 0.5, 1.5),
                    '& .MuiSvgIcon-root': {
                        mr: 0.5,
                    },
                    '& .MuiInput-underline:before': {
                        borderBottom: 1,
                        borderColor: 'divider',
                    },
                }}
            />
            <Message selectedGroups={props.selectedGroups} />
        </Box>
    );
}


export default function Session() {
    const { data } = useDemoData({
        dataSet: 'Commodity',
        rowLength: 100,
        maxColumns: 6,
    });

    const [searchText, setSearchText] = useState('');
    const [rows, setRows] = useState([]);
    const [prows, setProws] = useState([]);

    const requestSearch = (searchValue) => {
        setSearchText(searchValue);
        const searchRegex = new RegExp(escapeRegExp(searchValue), 'i');
        console.log(searchValue)
        const filteredRows = prows.filter((row) => {
            return Object.keys(row).some((field) => {
                return searchRegex.test(row[field].toString());
            });
        });
        // console.log(filteredRows)
        setRows(filteredRows);
    };
    const sessionState = useSessionState()

    const getGroups = async () => {
        try {
            updateLoaderState({ loading: true })
            const res = await axios.get('http://localhost:8080/getGroups')
            const { groupChats } = res.data
            let totalParticipants = 0
            let rows = groupChats && groupChats.map((group, iteration) => {
                totalParticipants = totalParticipants + group.groupMetadata.participants.length
                return {
                    sno: iteration + 1,
                    name: group.name,
                    id: group.id._serialized,
                    participants: group.groupMetadata.participants.length,
                }
            })
            if (sessionState.sessionName.get() !== null) {
                const sessionRef = collection(db, "sessions");

                await updateDoc(doc(sessionRef, sessionState.sessionName.get()), {
                    totalParticipants
                });
            }
            if (res.data.status === 'failed') {
                toast.error("No session found")
            }
            updateLoaderState({ loading: false })

            console.log(res.data)
            setProws(rows || [])
            setRows(rows || [])
        } catch (error) {
            console.log(error)
        }
    }

    const navigate = useNavigate()
    const authState = useAuthState()


    useEffect(() => {
        if (authState.token.get() == null) navigate('/login')
        else getGroups()

    }, [])







    const columns = [
        { field: 'sno', headerName: 'S.No', width: '140' },
        { field: 'name', headerName: 'Group name', width: '200' },
        { field: 'id', headerName: 'Group ID', width: '400' },
        { field: 'participants', headerName: 'Participants', width: '300' },
    ];

    const [selectedGroups, setSelectedGroups] = useState([])

    const logout = async () => {
        try {
            const res = await axios.get('http://localhost:8080/destroy')
            navigate('/')
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    return (
        <Box sx={{ height: 650, width: 1 }}>
            <h1>Your Groups</h1>
            <button
                onClick={logout}
            >Logout</button>
            <DataGrid
                components={{ Toolbar: QuickSearchToolbar }}
                rows={rows}
                columns={columns}
                componentsProps={{
                    toolbar: {
                        value: searchText,
                        onChange: (event) => requestSearch(event.target.value),
                        clearSearch: () => requestSearch(''),
                        selectedGroups
                    },
                }}
                rowsPerPageOptions={[500]}
                checkboxSelection
                // onSelectionModelChange={(item) => {
                //     const selectedIDs = new Set(item);
                //     const selectedRowData = rows.filter(row => selectedIDs.has(row.id))
                //     console.log(selectedRowData)
                //     // setSelectedGroups(prev => [...prev,])
                // }}
                onSelectionModelChange={(item) => {
                    // console.log(item)
                    setSelectedGroups(item)
                }}

            />
        </Box>
    );
}

