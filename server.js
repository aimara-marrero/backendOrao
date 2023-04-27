const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");
const app = express();

// Necesitamos usar el io en otros ficheros
const httpServer = createServer(app);
global.io = new Server(httpServer);

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

io.on("connection", (socket) => {

  //msg es el mensaje que es enviado desde userChatComponent'message from client'
    socket.on("client sends message", (msg) => {
      socket.broadcast.emit("server sends message from client to admin", {
        message: msg, 
    })
  })
  //msg es el mensaje que es enviado desde adminChatComponent'message from admin'
  socket.on("admin sends message", ({ message }) => {
    socket.broadcast.emit("server sends message from admin to client", message);
})
})

const apiRoutes = require("./routes/apiRoutes");

app.get("/", async (req, res, next) => {
  res.json({ message: "API running..." });
});

// mongodb connection
const connectDB = require("./config/db");
connectDB();

app.use("/api", apiRoutes);

app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(error);
  }
  next(error);
});
app.use((error, req, res, next) => {
  //mostrar mensaje de error en el caso de que solo estemos como dev
  if (process.env.NODE_ENV === "development") {
    res.status(500).json({
      message: error.message,
      stack: error.stack,
    });
  } else {
      res.status(500).json({
         message: error.message, 
      })
  }
});


const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));