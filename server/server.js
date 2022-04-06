const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  heartbeat,
  requestVote,
  initialize_logs,
} = require("./controllers/raft-comm");

const logsPath = "../home/node/logs.json";

const worker = require("worker_threads");
const dgram = require("dgram");

const db = require("./db");
const postRouter = require("./routes/post-router");

const app = express();
const port = 5000;
const udp_port = 4040;

var logs = initialize_logs(logsPath);

const udp_server = dgram.createSocket("udp4");

const raft_states = [
  0, //Follower
  1, //Candidate
  2, //Master
];

const node_id = process.env.NODE_ID;

var term = 0;

var state = 0;

state = process.env.MASTER === "yes" ? 2 : 0;
var timeout = parseInt((Math.random() / 2.0) * 1000); //in milliseconds

// console.log(timeout);

udp_server.on("error", (err) => {
  console.log(`udp server error:\n${err.stack}`);
  udp_server.close();
});

udp_server.on("message", (msg, rinfo) => {
  // console.log(`udp server got: ${msg}, my state: ${state}, my id: ${node_id}`);
  msg = JSON.parse(msg);

  if (msg.type === 0) {
    if (state === 1) {
      state = 0;
    }
    appendEntries(msg, state, logs, logsPath);
  }
  if (msg.type === 1) {
    let lastLog = logs[Object.keys(logs).length - 1];
    // if(compareLogs(msg, lastLog))
  }
});

udp_server.on("listening", () => {
  const address = udp_server.address();
  console.log(`udp server listening ${address.port}`);
});

udp_server.bind(udp_port);

// const isMaster = process.env.MASTER;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.get("/", (req, res) => {
  res.send("DS Project - Backend v3.0");
});

app.use("/api", postRouter);

app.listen(port, () => console.log(`Server running on ${port}`));

setInterval(heartbeat, 10000, udp_server, state, term, logs, logsPath);
