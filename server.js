const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const fileupload = require('express-fileupload');
app.use(fileupload());

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use(express.json({limit:'1mb'}));
const connectionString = 'postgres://mqlwciovxxeoaq:e9f5def919eef0d452cd64abba6b9cacae8ff7ceaf8512f8f3ba012ec0cfb144@ec2-54-226-56-198.compute-1.amazonaws.com:5432/damrrr50oj5i6o';

const { Client } = require('pg');
const { response } = require("express");
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
}); 

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.static("views"));
app.use("/peerjs", peerServer);

app.use(bodyParser.urlencoded({
  extended:true
}));

/*
app.get("/", (req, rsp) => {
 rsp.redirect(`/${uuidv4()}`);
}); 
*/
app.get("/", (req, rsp) => {
    rsp.render('index');
 });
 
 app.post('/room',function(req, rep){
    console.log(req.body.name);
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


let route_path = process.cwd();

app.post("/login", (req, rsp) => {
     
    client.connect();
    let valid_user = false;
    client.query("select * from user_data where username = " + "'" +req.body.username + "' ;", (err, res) => {
    if (err) {throw err; }
        console.log(res.rows);
   if( res.rows[0].password == req.body.password)
   {
         valid_user = true;
   }
  
   if(valid_user)
   {
    rsp.json({
      status : "true", 
      email : res.rows[0].email,
      image : res.rows[0].image_name,
    }); 
   }
   else{
    rsp.json({
      status : "false",
    });
   }
   
   client.end();
});
  
});
app.post("/Registration", (req,rsp)=>{

/*let tempfile = req.files.file;

let uploadpath = route_path +"\\views\\images\\" + tempfile.name; 
console.log(tempfile.type);
tempfile.mv(uploadpath, function(err){
        if(err) { console.log(err);}
         });

client.connect();
client.query("insert into user_data values( '" + req.body.rusername +"','"+req.body.email + "','" + req.body.rpassword + "','" +tempfile.name+ "');",(err,res)=>{
  console.log(err);
  if(err) {   throw err; }
  else{
  client.query("create table " + req.body.rusername + " (link varchar(200), meet_date date, meet_time time);",(err,res)=>{
  if (err) {throw err; } 
  client.end();
});
  }
   //rsp.sendFile(route_path + "login.html");
   
});*/
rsp.sendFile(route_path + "\\views\\login.html");
});
console.log(route_path);

server.listen(process.env.PORT || 3030);
