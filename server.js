const express = require("express");
const app = express();
const server = require("http").Server(app);
const connectionString = 'postgres://mqlwciovxxeoaq:e9f5def919eef0d452cd64abba6b9cacae8ff7ceaf8512f8f3ba012ec0cfb144@ec2-54-226-56-198.compute-1.amazonaws.com:5432/damrrr50oj5i6o';

const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
//const bodyParser = require("body-parser");
// Peer

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("views"));
app.use("/peerjs", peerServer);
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
  extended:true
}));

/*
app.get("/", (req, rsp) => {
 rsp.redirect(`/${uuidv4()}`);
}); 
*/
var mess = "hello";

const { Client } = require('pg');

const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect();
//create table scientist (id integer, firstname varchar(100), lastname varchar(100));
client.query('select * from username;', (err, res) => {
  if (err) throw err;
  console.log("Process Done");
  for (let row of res.rows) {
      console.log(row.name);
    console.log(JSON.stringify(row));
  }
  client.end();
});
  console.log(mess);
app.get("/", (req, rsp) => {
    
    rsp.send(mess);
 });

app.get("/", (req, rsp) => {
    rsp.render("index");
 });
 
 app.post('/room',function(req, rep){
     rep.redirect(`/${uuidv4()}`);
 });

app.get("/:room", (req, res) => {
 res.render("room", { roomId : req.params.room });
}); 

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
    socket.on("leave-meeting", (id)=>{
      io.to(roomId).emit("remove-stream",id);
    });
  });
});

server.listen(process.env.PORT || 3030);
