const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 5555;

// Initialize a HTTP server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

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

// Define a route for HTTP requests
app.get('/', (req, res) => {
    res.send('Hello from the HTTP server!');
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
