const http = require('http');
const socketIo = require('socket.io');

// Create HTTP server
const server = http.createServer();

// Initialize Socket.IO with CORS settings
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store the current board state
let boardState = [];
let currentUsers = 0;

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  currentUsers += 1;

  // Send the current users to all clients
  io.emit('currentUsers', currentUsers);
  
  // Send the current board state to the newly connected client
  socket.emit('boardState', boardState);
  
  // Listen for drawing actions from the client
  socket.on('draw', (drawData) => {
    // Add the drawing action to the board state
    boardState.push(drawData);
    
    // Broadcast the drawing action to all clients (including sender)
    io.emit('draw', drawData);
  });
  
  // Listen for board clear event
  socket.on('clear', () => {
    // Clear the board state
    boardState = [];
    
    // Broadcast the clear event to all clients (including sender)
    io.emit('clear');
  });
  
  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    currentUsers -= 1;
    
    // Send the updated user count to all clients
    io.emit('currentUsers', currentUsers);
  });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});