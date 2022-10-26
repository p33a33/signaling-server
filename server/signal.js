const express = require("express");
const { Server } = require("socket.io");

const app = express();
const port = 9000;

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

const io = new Server(9001, {
  cors: {
    origin: "*",
  },
});

io.on("connect", (socket) => {
  console.log("websocket is opened");
  console.log(socket);
  socket.addListener("message", (message) => {
    console.log(message);

    socket.emit("message", "yo");
  });

  socket.addListener("user:available", (name) => {
    console.log("new available user", name);
    socket.broadcast.emit("user:available", { name, id: socket.id });
  });

  socket.addListener("user:deleted", (name) => {
    console.log("deleted user", name);
    socket.broadcast.emit("user:deleted", name);
  });

  socket.addListener("user:join", async (id) => {
    socket.broadcast.emit("user:unavailable", id);
    socket.to(id);
  });

  socket.addListener("offer", (offer, targetUserId) => {
    socket.to(targetUserId).emit("offer", { offer, targetUserId });
  });

  socket.addListener("answer", (answer, offerUserid) => {
    console.log(answer);
    socket.to(offerUserid).emit("answer", { answer, offerUserid });
  });

  socket.addListener("new-ice-candidate", (candidate) => {
    console.log("broadcast new-candidate", candidate);
    socket.broadcast.emit("new-candidate", candidate);
  });
});
