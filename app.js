const express = require("express");
// socket= is user for real time game communcation
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
// const { title } = require("process");

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
let players = {};
// There first user come to white side
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", (uniquesocket) => {
  console.log("connected");

  if (!players.white) {
    players.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
  } else {
    uniquesocket.emit("spectatorRole");
  }

  uniquesocket.on("disconnect", () => {
    if (uniquesocket.id === players.white) {
      delete players.white;
    } else if (uniquesocket.id === players.black) {
      delete players.black;
    }
  });

 uniquesocket.on("move",(move)=>{
    try {
        // White player time only play white user not black aslo play black 
        // user ther move but this time move return previes location beceuse on white time white play
        if(chess.turn()=== "w" && uniquesocket.id !== players.white)return;
        if(chess.turn()=== "b" && uniquesocket.id !== players.black)return;

        const result = chess.move(move);
        if (result) {
            currentPlayer = chess.turn();
            io.emit("move",move); 
            io.emit("boardState", chess.fen());         
        }
        else{
            // io.emit("")
            console.log("invalid move: ", move);
            uniquesocket.emit("invalidMove", move);
        }
    } catch (error) {
        console.error("Error processing move: ", error);
       uniquesocket.emit("Invalid move :", move) 
    }
 })

});

server.listen(3000, () => {
  console.log("server is running on port 3000");
});
