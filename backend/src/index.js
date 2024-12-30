    import express from "express"
    import {createServer} from "node:http"
    import {Server} from "socket.io"
    import mongoose from "mongoose"
    import cors from "cors"
    import { connectToSocket } from "./controllers/socketManager.js"
    import usersRoute from "./routes/users.route.js"

    const app = express()
    const server = createServer(app);
    const io =connectToSocket(server)

    app.set("port",(process.env.PORT ||8000))
    app.use(cors())
    app.use(express.json({limit:"40kb"}))
    app.use(express.json({limit:"40kn", extended:true}))

    app.use("/api/v1/users", usersRoute)

    app.get("/api/v1/users",(req,res)=>{
        res.send("Hello World")
    })

    const Start = async ()=>{
        app.set("mongo_user")
        const connectionDb = await mongoose.connect("mongodb+srv://mdshahnawazm17:0786%401234@cluster0.ucjqz7r.mongodb.net/ZoomApp")
        console.log(`MongoDB Connected ${connectionDb.connection.host}`);
        
        server.listen(app.get("port"), ()=>console.log(`App is listening on Port 8000`))
    }

    Start();