import express from 'express'
import cors from 'cors'
import connectDB from './services/mongo.js'
import dotenv from 'dotenv';
dotenv.config()
import multer from 'multer';
import userrouter from './routes/authRoutes.js';
import chatrouter from './routes/chat.js';
import { Server } from 'socket.io';
import initSocket from './services/socket.js';
import http from 'http';

const upload = multer();
const app = express();
app.use(cors());

connectDB().catch(err => console.error('DB connection error:', err));

const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(upload.array());

app.get('/', (req, res) => {
    res.send('API is running....');
})

app.cors = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use('/api/users', userrouter);
app.use("/api/chat", chatrouter);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Initialize socket logic ONCE
initSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});

// REMOVE THIS - Don't start app.listen() again
// app.listen(PORT, () => console.log("Server Started on port", PORT));