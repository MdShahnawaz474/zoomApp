import { Server, Socket } from "socket.io"


export const connectToSocket = (server)=>{
    const io = new Server(server)
    io.on("connect",(socket)=>{
        socket.on("join-call",(path)=>{
            if (connection[path]=== undefined){
                
            }
        })

        socket.on("signal",(toId, message)=>{
            io.to(toId).emit("signal", socket.id,message)
        })

        socket.on("chat-message", (data, sender)=>{

        })
        socket.on("disconnect", ()=>{

        })
    })
    return io;
}