const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const io = require("socket.io")(server);
const bodyParser = require("body-parser");
const fileupload = require('express-fileupload');
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});
const route_path = process.cwd();


const connectionString = 'postgres://mqlwciovxxeoaq:e9f5def919eef0d452cd64abba6b9cacae8ff7ceaf8512f8f3ba012ec0cfb144@ec2-54-226-56-198.compute-1.amazonaws.com:5432/damrrr50oj5i6o';

const { Client } = require('pg');
const { response } = require("express");
const client = new Client({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
}); 


app.use(fileupload());
app.use(express.json({limit:'1mb'}));
app.set("view engine", "ejs");
  app.use(express.static("public"));
app.use(express.static("views"));
app.use("/peerjs", peerServer);
app.use(bodyParser.urlencoded({
  extended:true
}));


app.get("/", (req, rsp) => {
    rsp.render('index');
 });
 
app.get("/:room", (req, res) => {
 if(req.params.room == "temp"){
 res.render("login");
 } 
 else{
 res.render("room", { roomId : req.params.room });
 }
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




app.post("/login", (req, rsp) => {
   
        let valid_user = false;
        client.connect();

        client.query("select * from user_data where username = " + "'" +req.body.username + "' ;", (err, res) => {
       
        if (err) { rsp.send(err); }

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
              error : err,
              url :res.rows[0].url,
          }); 
        }
        else{
          rsp.json({
                status : "false",
                error : err,
          });
        }

   client.end();
});
  
});
app.post("/Registration", (req,rsp)=>{

let tempfile = req.files.file;

    let uploadpath = route_path +"\\views\\images\\" + tempfile.name; 
    console.log(tempfile.type);
    tempfile.mv(uploadpath, function(err){
            if(err) { throw err ;}
            });

  client.connect();

  let url  = "https://foxsh-video-conferencing-app.herokuapp.com/" + uuidv4();

  client.query("insert into user_data values( '" + req.body.rusername +"','"+req.body.email + "','" + req.body.rpassword + "','" +tempfile.name+ "' '" + url + "');",(err,res)=>{
  if(err) {   throw err ; }
  client.end(); 
  });

  rsp.render('login');
  });




server.listen(process.env.PORT || 3030);
