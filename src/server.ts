import app from "./app.js";
import "dotenv/config";
import { createServer } from "http";
import { initializeSocket } from "./socket/socket.js";
import { registerSocketHandlers } from "./socket/index.js";

const httpServer = createServer(app);

const io = initializeSocket(httpServer);

registerSocketHandlers(io);


const PORT = 8000;

// this is we are using for only creating express server
// app.listen(PORT, () => {
//   console.log(`🚀 Server is running on http://localhost:${PORT}`);
// });

// this is we are using for expose our backend 
// app.listen(PORT, "0.0.0.0", () => {
//   console.log(`Server running on port ${PORT}`);
// });

// now this is we are creating for server for socket.io



httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});