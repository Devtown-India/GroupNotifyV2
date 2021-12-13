import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Button from '@mui/material/Button';
import { BsWhatsapp } from "react-icons/bs";
import { updateAuthState, useAuthState } from '../state/user';
import { Link } from 'react-router-dom'
import { getAuth, signOut } from "firebase/auth";
import { auth } from '../firebase/firebase';
import toast from 'react-hot-toast';
import { log } from '../logs/createLog';
import { useNavigate } from 'react-router-dom'

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

export default function SearchAppBar() {
    const authState = useAuthState()
    const navigate = useNavigate()
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar style={{ border: 'none', shadow: 'none', background: "black" }}>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                        <BsWhatsapp color={'#f1f1f1'} size={30} />
                    </Typography>
                    {
                        authState.token.get() ? <Button onClick={() => {
                            signOut(auth).then(() => {
                                // Sign-out successful.
                                toast.success("Logged out successfully")
                                updateAuthState({ token: null, email: null })
                            }).catch((error) => {
                                // An error happened.
                                toast.error("Error logging out")

                            });
                            navigate('/')
                        }} style={{ color: "white" }} color="secondary" variant="contained" size="medium">
                            Logout
                        </Button> : <Link to='/login'><Button style={{ color: "white" }} color="secondary" variant="contained" size="medium">
                            Login
                        </Button> </Link>
                    }

                </Toolbar>
            </AppBar>
        </Box>
    );
}