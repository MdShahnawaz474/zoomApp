import { Button } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import { connect, io } from "socket.io-client";

const serverUrl = "http://localhost:8000";

declare global {
  interface Window {
    localstream: MediaStream;
  }
}
let connections: any = {};

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
  let [screen, setScreen] = useState<any>();
  let [showModel, setShowModel] = useState<any>();
  let [screenAvailable, setScreenAvailable] = useState<boolean | undefined>(
    undefined
  );
  let [messages, setMessages] = useState<any>([]);
  let [message, setMessage] = useState("");
  let [newMessage, setNewMessage] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");

  const videoRefrence = useRef<{ socketId: string }[]>([]);
  let [videos, setVideos] = useState<any>([]);

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

  let getUserMediaSuccess = (stream: any) => {};

  let getUserMedia = () => {
    if ((videos && videoAvailable) || (audio && audioAvailable)) {
      navigator.mediaDevices
        .getUserMedia({ video: videos, audio: audio })
        .then(getUserMediaSuccess)
        .then(() => {})
        .catch((e) => console.log(e));
    } else {
      try {
        let tracks = (
          localVideoRef.current?.srcObject as MediaStream
        ).getTracks();
        tracks?.forEach((track: any) => track.stop());
      } catch (error) {}
    }
  };
  useEffect(() => {
    if (videos !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, videos]);

  let gotMessageFromServer = (fromId: string, message: string) => {};

  let connectToSocketServer = () => {
    socketRef.current = io(serverUrl, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);

      socketIdRef.current = socketRef.current.id;

    
      socketRef.current.on("user-left", (id: string) => {
        setVideos((prevVideos:any) => prevVideos.filter((v:any) => v.socketId !== id));
      });

      socketRef.current.on("user-joined", (id: string, clients: any) => {
        clients.forEach((socketListid: any) => {
          connections[socketListid] = new RTCPeerConnection(
            peerConfigConnection
          );

          connections[socketListid].onicecandidate = (event: any) => {
            if (event.candidate != null) {
              socketRef.current.emit(
                "signal",
                socketListid,
                JSON.stringify({
                  ice: event.candidate,
                })
              );
            }
          };

          connections[socketListid].onaddstream = (event: any) => {
            let videoExists = videoRefrence.current.find(
              (videos) => videos.socketId === socketListid
            );
            if (videoExists) {
              setVideos((videos: any) => {
                const updateVideo = videos.map((video: any) => {
                  video.socketId === socketListid
                    ? { ...video, stream: event.stream }
                    : video;
                });
                videoRefrence.current = updateVideo;
              });
            } else {
              let newVideo = {
                socketId: socketListid,
                stream: event.stream,
                autoplay: true,
                playsinline: true,
              };
              setVideos((videos: any) => {
                const updateVideo = [...videos, newVideo];
                videoRefrence.current = updateVideo;
                return updateVideo;
              });
            }
          };
          if (window.localstream !== undefined && window.localstream !== null) {
            connections[socketListid].addStream(window.localstream as MediaStream);
          }else{
            // let blackSilence
          }
          
        });
        if (id === socketIdRef.current){
          for (let id2 in connections){
            if(id2 === socketIdRef.current) continue

            try {
              connections[id2].addStream(window.localstream);
            } catch (error) {
              connections[id2].createOffer().then((description :any )=>{
                connections[id2].setLocalDescriptio(description) 
                .then(()=>{
                  socketRef.current.emit("signal",id2 ,JSON.stringify({"sdp":connections[id2].localDescription}))
                }).catch((e:any)=>console.log(e)
                )
              })
            }
          }
        }

      });

      
    });
  };

  let getMedia = () => {
    setVideos(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };
  let connect = () => {
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div>
          <h2>Enter into lobby</h2>
          {/* {username} */}
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            variant="outlined"
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <div>
            <video  ref={localVideoRef} autoPlay muted></video>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default VideoMeet;
