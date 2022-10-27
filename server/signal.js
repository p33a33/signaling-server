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

let availableUsers = [];

io.on("connect", (socket) => {
  console.log("websocket is opened");
  console.log(socket);
  socket.addListener("message", (message) => {
    console.log(message);

    socket.emit("message", "yo");
  });

  socket.addListener("user:new", (name) => {
    console.log("new user", name);
    socket.broadcast.emit("user:new", { name, id: socket.id });
    availableUsers.push({ name, id: socket.id, state: "AVAILABLE" });
  });

  socket.addListener("user:available", (name) => {
    console.log("new available user", name);
    socket.broadcast.emit("user:available", { name, id: socket.id });
  });

  socket.addListener("user:unavailable", (name) => {
    console.log("unavailable user");
    socket.broadcast.emit("user:unavailable", name);
    availableUsers = availableUsers.map((user) => {
      if (name === user.name) {
        return {
          ...user,
          state: "UNAVAILABLE",
        };
      } else {
        return user;
      }
    });
  });

  socket.addListener("user:deleted", (name) => {
    console.log("deleted user", name);
    socket.broadcast.emit("user:deleted", name);
  });

  socket.addListener("user:join", async (id) => {
    socket.broadcast.emit("user:unavailable", id);
    socket.to(id);
  });

  socket.addListener("connect:reject", (callerId) => {
    socket.to(callerId).emit("connect:reject");
  });

  socket.addListener("offer", (offer, targetUserId) => {
    socket.to(targetUserId).emit("offer", { offer, callerId: socket.id });
  });

  socket.addListener("answer", (answer, callerId) => {
    console.log(answer);
    console.log(callerId);
    socket.to(callerId).emit("answer", answer);
  });

  socket.addListener("new-ice-candidate", (candidate) => {
    console.log("broadcast new-candidate", candidate);
    socket.broadcast.emit("new-candidate", candidate);
  });
});
