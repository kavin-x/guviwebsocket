const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

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
        console.log(message);
        const decodedMessage = require('msgpack-lite').decode(new Uint8Array(message));

        if (!clientId) {
            if (decodedMessage.id) {
                clientId = decodedMessage.id;
                clients.set(clientId, ws);
                ws.send(require('msgpack-lite').encode({ message: `Client ID ${clientId} registered successfully` }));
                console.log(`Client ID ${clientId} registered`);
            } else {
                ws.send(require('msgpack-lite').encode({ error: 'No ID provided' }));
            }
        } else {
            const targetId = decodedMessage.targetId;
            const msg = decodedMessage.message;

            // Send the message to the target client if it exists
            if (clients.has(targetId)) {
                clients.get(targetId).send(require('msgpack-lite').encode({ message: `Message from ${clientId}: ${msg}` }));
            } else {
                ws.send(require('msgpack-lite').encode({ error: `Client with ID ${targetId} does not exist` }));
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

// Serve the HTML file
app.use(express.static(path.join(__dirname, 'public')));

// Define a route for HTTP requests
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
