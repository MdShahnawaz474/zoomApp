import  { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'

import { Button, IconButton, InputAdornment, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContex';
import Logo3 from "../images/logo3.png"

import styles from "../styles/homeComponent.module.css";
import { Videocam } from '@mui/icons-material';
import KeyboardIcon from '@mui/icons-material/Keyboard';
function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory}:any = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <div  style={{color:"white"}}>

            <div className="navBar" >

                <div style={{ display: "flex", alignItems: "center", }}>

                    <h2>Zoom App</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <IconButton onClick={
                        () => {
                            navigate("/history")
                        }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    <p>History</p>

                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>
                        Logout
                    </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Connect, collaborate and celebrate from anywhere with Zoom App</h2>

                        <div style={{ display: 'flex', gap: "10px" }}>

                            <TextField className={styles.homeTextField}
                        
                            onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" 
                            variant="outlined"
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <KeyboardIcon />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                            />


                            <Button className={styles.JoinButton} onClick={handleJoinVideoCall} variant='contained' startIcon={<Videocam/>}>Join</Button>

                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet={Logo3} alt="" />
                </div>
            </div>
        </div>
    )
}


export default withAuth(HomeComponent)