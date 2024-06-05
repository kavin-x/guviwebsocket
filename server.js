const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const app = express();
const port = 3000;

// Initialize a HTTP server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// Store clients in a Map
const clients = new Map();

wss.on('connection', (ws) => {
    const id = uuidv4(); // Generate a unique ID for the client
    clients.set(id, ws);
    console.log(`Client connected: ${id}`);

    // Send a welcome message with the client ID
    ws.send(`Welcome to the WebSocket server! Your ID is ${id}`);

    // Receiving messages from the client
    ws.on('message', (message) => {
        console.log(`Received from ${id}:`, message);

        // Extract target client ID and message from the received message
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (e) {
            console.error('Invalid message format', message);
            return;
        }

        const targetId = parsedMessage.targetId;
        const msg = parsedMessage.message;

        // Send the message to the target client if it exists
        if (clients.has(targetId)) {
            clients.get(targetId).send(`Message from ${id}: ${msg}`);
        } else {
            ws.send(`Client with ID ${targetId} does not exist`);
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        clients.delete(id);
        console.log(`Client disconnected: ${id}`);
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
