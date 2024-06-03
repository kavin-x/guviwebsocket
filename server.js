const express = require('express');
const server = require('http').createServer();
const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({server: server}, function(){});

const app = express();
const port = 3000;

wss.on('connection', (ws) => {
    console.log('Client connected');
    // Send a welcome message
    ws.send('Welcome to the WebSocket server!');
    // Receiving messages from the client
    ws.on('message', (message) => {
        console.log('Received:', message);
        // Echo the message back to the client
        ws.send(`Echo: ${message}`);
    });
    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    // Handle errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

app.get('/', (req, res) => {
    res.send('Hello from the HTTP server!');
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
