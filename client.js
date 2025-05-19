document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const canvas = document.getElementById('whiteboard');
  const context = canvas.getContext('2d');
  const colorInput = document.getElementById('color-input');
  const brushSizeInput = document.getElementById('brush-size');
  const brushSizeDisplay = document.getElementById('brush-size-display');
  const clearButton = document.getElementById('clear-button');
  const connectionStatus = document.getElementById('connection-status');
  const userCount = document.getElementById('user-count');

    // Drawing variables
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let boardState = [];

  // Set canvas dimensions
  function resizeCanvas() {
    // TODO: Set the canvas width and height based on its parent element
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width
    canvas.height = rect.height
    redrawCanvas(boardState);
  }

  // Initialize canvas size
  // TODO: Call resizeCanvas()
  resizeCanvas();
  // Handle window resize
  window.addEventListener('resize', resizeCanvas);


  // Connect to Socket.IO server
  // TODO: Create a socket connection to the server at 'http://localhost:3000'
  const socket = io('http://localhost:3000');
  // TODO: Set up Socket.IO event handlers
  socket.on('connect', () => {
    connectionStatus.textContent = 'Connected';
    connectionStatus.classList.add('connected');
  });

  socket.on('disconnect', () => {
    connectionStatus.textContent = "Disconnected";
    connectionStatus.classList.remove('connected');
  });

  socket.on('draw', (data) => {
    drawLine(data.x0, data.y0, data.x1, data.y1, data.color, data.size)
    boardState.push(data);

  });

  socket.on('clear', () => {
    boardState = [];
    redrawCanvas(boardState);
  });

  socket.on('boardState', (state) => {
    boardState = state;
    redrawCanvas(boardState);
  });

  socket.on('currentUsers', (count) => {
    userCount.textContent = count;
  })
  // Canvas event handlers
  // TODO: Add event listeners for mouse events (mousedown, mousemove, mouseup, mouseout)
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseout', stopDrawing);
  // Touch support (optional)
  // TODO: Add event listeners for touch events (touchstart, touchmove, touchend, touchcancel)
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
  canvas.addEventListener('touchcancel', stopDrawing);
  // Clear button event handler
  // TODO: Add event listener for the clear button
  clearButton.addEventListener('click', () => {
    clearCanvas();
  });

  // Update brush size display
  // TODO: Add event listener for brush size input changes
  brushSizeInput.addEventListener('input', () => {
    brushSizeDisplay.textContent = brushSizeInput.value;
  });

  // Drawing functions
  function startDrawing(e) {
    // TODO: Set isDrawing to true and capture initial coordinates
    const {x, y} = getCoordinates(e);
    isDrawing = true;
    lastX = x;
    lastY = y;
  }

  function draw(e) {
    // TODO: If not drawing, return
    // TODO: Get current coordinates
    // TODO: Emit 'draw' event to the server with drawing data
    // TODO: Update last position
    if (!isDrawing) return;

    const {x, y} = getCoordinates(e);
    const color = colorInput.value;
    const size = parseInt(brushSizeInput.value);

    socket.emit('draw', { 
      x0: lastX, 
      y0: lastY,
      x1: x,
      y1: y, 
      color, 
      size
    })

    lastX = x;
    lastY = y;
  }

  function drawLine(x0, y0, x1, y1, color, size) {
    // TODO: Draw a line on the canvas using the provided parameters
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = size;
    context.lineCap = 'round';
    context.stroke();
    context.closePath();
  }

  function stopDrawing() {
    // TODO: Set isDrawing to false
    isDrawing = false;

  }

  function clearCanvas() {
    // TODO: Emit 'clear' event to the server
    socket.emit('clear');
  }

  function redrawCanvas(boardState = []) {
    // TODO: Clear the canvas
    // TODO: Redraw all lines from the board state
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let line of boardState) {
      drawLine(line.x0, line.y0, line.x1, line.y1, line.color, line.size);
    }
  }

  // Helper function to get coordinates from mouse or touch event
  function getCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.offsetX,
        y: e.offsetY
      };
    }
  }
  // Handle touch events
  function handleTouchStart(e) {
    e.preventDefault();
    startDrawing(e);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    draw(e);
  }
});