import { TextFieldsOutlined } from "@mui/icons-material";
import { Button, useMediaQuery } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";

const serverUrl = "http://localhost:8000";
let connections = {};

const peerConfigConnection = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function VideoMeet() {
  let socketRef = useRef();
  let socketIdRef = useRef();
  let localVideoRef = useRef<HTMLVideoElement>(null); 

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [audio, setAudio] = useState<any>();
  let [screen, setScreen] = useState<any>();
  let [showModel, setShowModel] = useState<any>();
  let [screenAvailable, setScreenAvailable] = useState<boolean | undefined>(undefined);
  let [messages, setMessages] = useState<any>([]);
  let [message, setMessage] = useState("");
  let [newMessage, setNewMessage] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRefrence = useRef([]);
  let [videos, setVideos] = useState([]);

  // if(ischrome===false){}

  const getPermission = async ()=>{
    try {
        const videoPermission = await navigator.mediaDevices.getUserMedia({video:true})
        if (videoPermission){
            setVideoAvailable(true);

        }else{
            setVideoAvailable(false);
        }

        const audioPermission= await navigator.mediaDevices.getUserMedia({audio:true});
        if(audioPermission){
            setAudioAvailable(true)
        }else{
            setAudioAvailable(false)
        }

        if(await navigator.mediaDevices.getDisplayMedia){
            setScreenAvailable(true);
        }else {
            setScreenAvailable(false);
        }

        if(videoAvailable || audioAvailable){
            const userMediaStrem = await navigator.mediaDevices.getUserMedia({video:videoAvailable,audio:audioAvailable});
            if(userMediaStrem){
                (window as any).localstream = userMediaStrem; 
                if(localVideoRef.current){
                    localVideoRef.current.srcObject = userMediaStrem;
                }
            }
        }

        
        
    } catch (error) {
        throw error;
    }
}
  useEffect(()=>{
    getPermission()
  },[])

  return (
    <div>
        { askForUsername === true ?<div>
            <h2>Enter into lobby</h2>
            {/* {username} */}
        <TextField id="outlined-basic" label="Username" value={username} variant="outlined" onChange={(e) => setUsername(e.target.value)} />
            <Button variant="contained">Connect</Button>
            <div> 
                <video ref={localVideoRef} autoPlay muted></video>
            </div>
        </div>
        : <> </>}
        </div>
  );
}

export default VideoMeet;
