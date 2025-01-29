import { Badge, Button, IconButton, prerelease } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import styles from  "../styles/videoComponent.module.css"
import { CallEnd, Chat, KeyboardVoice, Mic, MicOff, ScreenShare, StopScreenShare, TextFields, Videocam, VideocamOff } from "@mui/icons-material";

declare global {
  interface Window {
    localstream: MediaStream;
  }
}
let connections: any = {};
const serverUrl = "http://localhost:8000";

const peerConfigConnection = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function VideoMeet() {
  let socketRef = useRef<any>();
  let socketIdRef = useRef<any>();
  let localVideoRef = useRef<HTMLVideoElement>(null);

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [audio, setAudio] = useState<any>();

  let [video, setVideo] = useState<any>([]);
  
  let [screen, setScreen] = useState<any>();
  let [showModel, setShowModel] = useState<any>();
  let [screenAvailable, setScreenAvailable] = useState<boolean | undefined>(
    undefined
  );
  let [messages, setMessages] = useState<any>([]);
  let [message, setMessage] = useState("");
  let [newMessage, setNewMessage] = useState(5);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRefrence = useRef<{ socketId: string }[]>([]);
  let [videos, setVideos] = useState<any[]>([]);

  // if(ischrome===false){}

  const getPermission = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
      } else {
        setAudioAvailable(false);
      }

      if (await navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoAvailable || audioAvailable) {
        const userMediaStrem = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStrem) {
          (window as any).localstream = userMediaStrem;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStrem;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  };
  useEffect(() => {
    getPermission();
  }, []);

  let getUserMediaSuccess = (stream: MediaStream) => {
    try {
      window.localstream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    } catch (e) {
      console.log(e);

    }
    window.localstream = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    for (let id in connections) {
      if (id === socketIdRef.current) continue;

      connections[id].addStream(window.localstream);

      connections[id].createOffer().then((description: RTCSessionDescriptionInit) => {
        console.log(description);
        connections[id].setLocalDescription(description)
          .then(() => {
            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
          })
          .catch((e: any) => console.log(e));
      });
    }
     stream.getTracks().forEach((track:MediaStreamTrack)=> track.onended = ()=>{
      setVideo(false)
      setAudio(false)
    try {
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        let tracks = (localVideoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track: MediaStreamTrack) => track.stop());
      }
    } catch (error) {
      console.log(error);
    }
    let blackSilence = (...args: any[]) => new MediaStream([black(...args) as MediaStreamTrack, silence() as MediaStreamTrack]);
    window.localstream = blackSilence();
    

      
        for(let id in connections){
          connections[id].addStream(window.localstream)
          connections[id].createOffer().then((description:any)=>{
            connections[id].setLocalDescription(description).then(()=>{
              socketRef.current.emit("signal",id,JSON.stringify({"sdp":connections[id].localDescription})
              )
            })
          }).catch((e:any)=>{console.log(e);
          })
        
      }

     })
  };

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();
    let dst = oscillator.connect(ctx.createMediaStreamDestination()) as MediaStreamAudioDestinationNode;

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], {
      enabled: false,
    });
  };


  let black = ({ width= 640,height= 480} = {})=>{
      let canvas =  Object.assign(document.createElement("canvas"),{width,height});

      const context = canvas.getContext('2d');
      if (context) {
        context.fillRect(0, 0, width, height);
      }
      let stream = canvas.captureStream()
      return Object.assign(stream.getVideoTracks()[0],{enabled:false})
  } 
  
  let getUserMedia = () => {
    if ((video && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video : video, audio: audio })
        .then(getUserMediaSuccess)
        .then(() => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = (
          localVideoRef.current?.srcObject as MediaStream
        ).getTracks();
        tracks?.forEach((track: any) => track.stop());
      } catch (error) {console.log(error);
      }
     
    }
 
  };
  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);

  let gotMessageFromServer = (fromId: string, message: string) => {
    let signal = JSON.parse(message);

      if(fromId !== socketIdRef.current){
        if(signal.sdp){
          connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(()=>{
            if(signal.sdp.type === "offer"){
              connections[fromId].createAnswer().then((description:any)=>{
                connections[fromId].setLocalDescription(description).then(()=>{
                  socketRef.current.emit("signal", fromId, JSON.stringify({
                    "sdp": connections[fromId].localDescription
                  })
                ).catch((e:any)=>{
                  console.log(e);
                }).catch((e:any)=>{
                  console.log(e);
                  
                })
                })
              }).catch((e:any)=>{
                console.log(e);
                
              })
            }
          }).catch((e:any)=>{
            console.log(e);
          })
        }
        if(signal.ice){
          connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e:any) => console.log(e))
        }
      }
  };

  
  let connectToSocketServer = () => {
    socketRef.current = io(serverUrl, { secure: false });

     // Remove existing listeners to prevent duplicates
    

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current?.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id

   
      socketRef.current.on('chat-message', addMessage);
      
    
      socketRef.current.on("user-left", (id: string) => {
        setVideos((videos:any) => videos.filter((video:any) => video.socketId !== id));
      });

      socketRef.current.on("user-joined", (id: string, clients: any) => {
        clients.forEach((socketListid: any) => {
          if (!connections[socketListid]) {
            connections[socketListid] = new RTCPeerConnection(peerConfigConnection);
      
            connections[socketListid].onicecandidate = (event: any) => {
              if (event.candidate != null) {
                socketRef.current?.emit("signal", socketListid, JSON.stringify({ ice: event.candidate }));
              }
            };
      
            connections[socketListid].onaddstream = (event: any) => {
              let videoExists = videoRefrence.current.find((video) => video.socketId === socketListid);
      
              if (videoExists) {
                setVideos((videos: any) => {
                  const updateVideos = videos.map((video: any) =>
                    video.socketId === socketListid ? { ...video, stream: event.stream } : video
                  );
                  videoRefrence.current = updateVideos;
                  return updateVideos;
                });
              } else {
                let newVideo = { socketId: socketListid, stream: event.stream, autoplay: true, playsinline: true };
                setVideos((videos: any) => {
                  const updateVideo = [...videos, newVideo];
                  videoRefrence.current = updateVideo;
                  return updateVideo;
                });
              }
            };
          }
      
          if (window.localstream) {
            connections[socketListid].addStream(window.localstream);
          }
        });
      });
    

      
    });

    useEffect(() => {
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current.off(); // Remove all listeners
        }
        // Cleanup media streams
        if (window.localstream) {
          window.localstream.getTracks().forEach((track) => track.stop());
        }
      };
    }, []);
  };

  let getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };
  let connect = () => {
    setAskForUsername(false);
    getMedia();
    connectToSocketServer();
  };

  let handleVideo= ()=>{
    setVideo(!video);
  }
  let handleAudio = ()=>{
    setAudio(!audio);
  }

  let getDisplayMediaSuccess = (stream: any) => {
    try {
      // Stop all tracks in the current localstream if it exists
      if (window.localstream) {
        window.localstream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.log(e);
    }
  
    // Assign the new stream to localstream
    window.localstream = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream; // Add this line
    }
  
    // Add the new stream to all peer connections
    for (let id in connections) {
      if (id === socketIdRef.current) continue; // Skip the current socket ID
  
      connections[id].addStream(window.localstream);
  
      // Create an offer and send it through the signaling server
      connections[id]
        .createOffer()
        .then((description: any) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((e: any) => {
              console.log(e);
            });
        })
        .catch((e: any) => {
          console.log(e);
        });
    }
  
    
    stream.getTracks().forEach((track:any) => 
      track.onended =()=>{
        setScreen(false);
        try {
          let tracks = (localVideoRef.current?.srcObject as MediaStream)?.getTracks()
          tracks.forEach(track => track.stop())
        } catch (error) {
          console.log(error);
        }
       
        let blackSilence = (...args: any[]) => new MediaStream([black(...args), silence()])
        window.localstream = blackSilence()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = window.localstream
          getUserMedia()
        }

      

      }
    )};
   

  let getDisplayMedia=()=>{
    if(screen){
      if(navigator.mediaDevices.getDisplayMedia){
        navigator.mediaDevices.getDisplayMedia({
          video: true , audio:true 
        }).then(getDisplayMediaSuccess)
        .then((stream)=>{

        }).catch((e:any)=>{
          console.log(e);
          
        })
      }
    }
  }
useEffect(()=>{
  if(screen!== undefined){
    getDisplayMedia();

  }
},[screen])
let handleScreen = () => {
  setScreen(!screen);
}

let handleChat = () => {
  setShowModel(!showModel);
}

let sendMessage = () => {
  socketRef.current?.emit("chat-message",  message, username);
  setMessage("");
}


let addMessage = (data :any, sender: any, socketIdSender:any) =>{
  setMessages((prevMessage:any) =>[
    ...prevMessage,
    {sender: sender , data: data}
  ])
  if(socketIdSender !== socketIdRef.current){
    setNewMessage((prevMessage)=> prevMessage+1)
  }
}
    return (
      <div>
        {askForUsername ? 
          <div className={styles.LobbyContainer}>
            <h2 className={styles.LobbyHeading} style={{marginTop:"10px"}}>Video calls and meetings for everyone</h2>
          <div className={styles.lobbyDiv} style={{marginTop:"4vh"}}>
            
          <TextField
            className={styles.LobbyTextField}
            
              id="outlined-basic"
              label="Username"
              value={username}
              variant="outlined"
              onChange={(e) => setUsername(e.target.value)
              
              }
            />
            <Button className={styles.lobbyButton}  variant="contained" onClick={connect} startIcon={<Videocam />}>Connect </Button>
          </div>
            <div className={styles.LobbyVideo}>
              <video ref={localVideoRef} autoPlay muted></video>
            </div>
          </div>
        : 
        
          <div className={styles.meetVideoContainer}>

            {showModel ?  <div className={styles.chatRoom}>
            <div className={styles.chatContainer}>
            <h1>Chat</h1>

          <div className={styles.chattingDisplay}>

            {messages.map((item:any,index:any)=>{
             return (<div>
                <h3>{item.sender}</h3>
                <p>{item.data}</p>
              </div>)
            })}

          </div>
            
           <div className={styles.chattingArea}>
           <TextField id="outlined-basic" value={message} onChange={e=>setMessage(e.target.value)} label="Enter Your chat" variant="outlined" />
           <Button className={styles.chatButton} onClick={sendMessage} variant="contained">Send</Button>
           </div>
            </div>
            </div>
            :<></>}
           
            <div className={styles.buttonContainer}>

              <IconButton onClick={handleVideo} style={{color:"white"}}>
                {(video === true )? <Videocam/>:<VideocamOff/>}
              </IconButton>
        
              <IconButton onClick={handleAudio} style={{color:"white"}}>
              {audio === true ? <Mic/>: <MicOff/>}
              </IconButton>

              { screenAvailable === true ? <IconButton onClick={handleScreen} style={{color:"white"}}>
                {screen === true ? <ScreenShare/> : <StopScreenShare/>  }
              </IconButton> :"" }

            <Badge badgeContent={newMessage} color="primary" max={999} >
              <IconButton onClick={handleChat} style={{color:"white"}}>
                <Chat/>
              </IconButton>
            </Badge>

              <IconButton style={{color:"red"}}>
              <CallEnd/>
              </IconButton >
            </div>

            <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>
    
           <div  className={styles.confrenceView}>
            {videos.map((video) => (
              <div key={video.socketId}>
                {/* <h2>{video.socketId}</h2> */}
                {/* Bind the stream to the remote video element */}
                <video
                  data-socket={video.socketId}
                  ref={(ref) => {
                    if (ref && video.stream) {
                      ref.srcObject = video.stream; 
                    }else{
                      console.log("not rendered");
                      
                    }
                  }}
                  autoPlay
                  
                  muted={false}  
                ></video>
              </div>
            ))}</div>
          </div>
        }
      </div>
    );
    

  
}

export default VideoMeet;
