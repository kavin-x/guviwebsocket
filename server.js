const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const port = 3000;

// Initialize a HTTP server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// Store clients in a Map
const clients = new Map();

wss.on('connection', (ws) => {
    let clientId = null;

    console.log('Client connected');

    // Handle initial message to set client ID
    ws.on('message', (message) => {
        if (!clientId) {
            try {
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.id) {
                    clientId = parsedMessage.id;
                    clients.set(clientId, ws);
                    ws.send(`Client ID ${clientId} registered successfully`);
                    console.log(`Client ID ${clientId} registered`);
                } else {
                    ws.send('Error: No ID provided');
                }
            } catch (e) {
                ws.send('Error: Invalid JSON format');
            }
        } else {
            try {
                const parsedMessage = JSON.parse(message);
                const targetId = parsedMessage.targetId;
                const msg = parsedMessage.message;

                // Send the message to the target client if it exists
                if (clients.has(targetId)) {
                    clients.get(targetId).send(`Message from ${clientId}: ${msg}`);
                } else {
                    ws.send(`Client with ID ${targetId} does not exist`);
                }
            } catch (e) {
                ws.send('Error: Invalid JSON format');
            }
        }
    });

    // Handle client disconnection
    ws.on('close', () => {
        if (clientId) {
            clients.delete(clientId);
            console.log(`Client disconnected: ${clientId}`);
        }
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
