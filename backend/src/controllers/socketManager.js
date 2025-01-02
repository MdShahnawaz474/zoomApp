
import { Server, Socket } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server)=>{
    const io = new Server(server,{
       cors:{ origin:"*",
              methods:["GET","POST"],
              allowedHeaders:["*"],
              credentials:true
       }
    })
    io.on("connect",(socket)=>{
        console.log("Something is connected");
        
        socket.on("join-call",(path)=>{
            if (connections[path]=== undefined){
                connections[path]=[]
            }
            connections[path].push(socket.id)
            timeOnline[socket.id]= new Date();
            for (let a = 0; a<connections[path].length; a++){
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }
            if(messages[path]=== undefined){
                for(let a=0; a<messages.length; ++a){
                    io.to(socket.id).emit("chat-messages", messages[path][a]['socket-id-sender'])
                }
            }
        })

        socket.on("signal",(toId, message)=>{
            io.to(toId).emit("signal", socket.id,message)
        })

        socket.on("chat-message", (data, sender)=>{

         const [matchingRoom,found]= Object.entries(connections).reduce(([room, isFound],[roomKey,roomValue])=>{
            if(!isFound && roomValue.includes(socket.id)){
                return [roomKey,true]
            }

            return [room,isFound];
         },["", false])

         if(found=== true){
            if(messages[matchingRoom]=== undefined){
                messages[matchingRoom]=[]
            }
            messages[matchingRoom].push({'sender':sender,'data':data,'socket-id-sender':socket.id})
            console.log('message',key , ":", sender,data);
            
            connections[matchingRoom].forEach((elem)=>{
                io.to(elem).emit("chat-message",data,sender, socket.id);
            })
         }


        })
        socket.on("disconnect", () => {
            let roomKey = null;
            
            // Find which room the user was in
            for (const [room, users] of Object.entries(connections)) {
                if (users.includes(socket.id)) {
                    roomKey = room;
                    break;
                }
            }
        
            if (roomKey) {
                // Notify all other users in the room
                connections[roomKey].forEach((userId) => {
                    if (userId !== socket.id) {
                        io.to(userId).emit("user-left", socket.id);  // Corrected to 'io.to' instead of 'to.to'
                    }
                });
        
                // Remove the user from the room
                connections[roomKey] = connections[roomKey].filter((id) => id !== socket.id);
        
                // Delete the room if it's empty
                if (connections[roomKey].length === 0) {
                    delete connections[roomKey];
                }
            }
        });
        
    })
    return io;
}