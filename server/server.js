const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const {
  heartbeat,
  // requestVote,
  initialize_logs,
  appendEntries,
  sendVote,
  // compareLogs,
  promoteToCandidate,
  demoteToFollower,
  promoteToLeader,
  Timer,
} = require("./controllers/raft-comm");
const config = require("./config");

const logsPath = "../home/node/logs.json";
const entryLogsPath = "../home/node/entryLogs.json";

const worker = require("worker_threads");
const dgram = require("dgram");

const db = require("./db");
const postRouter = require("./routes/post-router");

const app = express();
const port = 5000;
const udp_port = 4040;

var logs = initialize_logs(logsPath);
var entryLogs = initialize_logs(entryLogsPath);

const udp_server = dgram.createSocket("udp4");

const raft_states = [
  0, //Follower
  1, //Candidate
  2, //Master
];

var num_nodes = config.NODES;

var votedFor = [];
// const node_id = process.env.NODE_ID;
var term = 0;
if (Object.keys(logs).length !== 0) {
  if (typeof logs[Object.keys(logs).length - 1].term == "number") {
    term = logs[Object.keys(logs).length - 1].term;
    votedFor.push(logs[Object.keys(logs).length - 1].votedFor);
  }
}

initialize_udp_socket = (udp_port) => {
  udp_socket = dgram.createSocket("udp4");

  udp_server.on("error", (err) => {
    console.log(`udp server error:\n${err.stack}`);
    udp_server.close();
  });

  udp_server.on("listening", () => {
    // const address = udp_server.address();
    // console.log(`udp server listening ${address.port}`);
  });

  udp_server.bind(udp_port);

  return udp_socket;
};

var state = 0;

var response = {};

var state_table = {};

initialize_state_table = (logs, entryLogs) => {
  var table = {};
  lastLog = {
    commitIndex: Object.keys(entryLogs).length - 1,
  };
  if (Object.keys(logs).length > 0) {
    commitIndex = logs[Object.keys(logs).length - 1].commitIndex;
  }
  for (var i = 1; i <= config.NODES; i++) {
    if (i != process.env.NODE_ID) {
      table[`Node${i}`] = {
        nextIndex: lastLog.commitIndex + 1,
        matchIndex: -1,
      };
    }
  }
  return table;
};

// state = process.env.MASTER === "yes" ? 2 : 0;
var timeout =
  parseInt(config.TIME_PERIOD) +
  parseInt(Math.random() * parseInt(config.TIME_PERIOD)); //in milliseconds

// console.log(timeout);

udp_server.on("error", (err) => {
  console.log(`udp server error:\n${err.stack}`);
  udp_server.close();
});

var votesFor = 1;
var votesReceived = 1;
var startElection = new Timer(() => {
  if (state === 0) {
    let res = promoteToCandidate(udp_server, logs, state, term);
    state = res.state;
    term = term + 1;
  }
}, timeout);

var heartbeat_timer = setInterval(
  heartbeat,
  config.TIME_PERIOD,
  udp_server,
  state,
  timeout,
  term,
  logs,
  entryLogs,
  logsPath,
  entryLogsPath
);

udp_server.on("listening", () => {
  const address = udp_server.address();
  console.log(`udp server listening ${address.port}`);
});

udp_server.bind(udp_port);

udp_server.on("message", (msg, rinfo) => {
  // console.log(`udp server got: ${msg}, my state: ${state}, my id: ${node_id}`);
  msg = JSON.parse(msg);
  // console.log(
  //   `For node: ${process.env.NODE_ID},  msg: ${JSON.stringify(
  //     msg
  //   )}, timeout: ${timeout}`
  // );
  if (parseInt(msg.request) === 2 && state === 1) {
    //Calculate Votes if candidate
    votesReceived = parseInt(votesReceived) + 1;
    if (msg.vote) {
      votesFor = parseInt(votesFor) + 1;
    }
    if (votesFor > parseInt(num_nodes / 2) + 1 || num_nodes == 2) {
      response = promoteToLeader(
        udp_server,
        state,
        timeout,
        term,
        logs,
        entryLogs,
        logsPath,
        entryLogsPath
      );
      state = response.state;
      term = response.term;
      state_table = initialize_state_table(logs, entryLogs);
      console.log(JSON.stringify(state_table));
      votesFor = 1;
      votesReceived = 1;
      clearInterval(heartbeat_timer);
      heartbeat_timer = setInterval(
        heartbeat,
        config.TIME_PERIOD,
        udp_server,
        state,
        timeout,
        term,
        logs,
        entryLogs,
        logsPath,
        entryLogsPath
      );
      startElection.stop();
    }
    if (
      votesReceived == parseInt(num_nodes) &&
      votesFor <= parseInt(num_nodes / 2)
    ) {
      console.log("No majority. Demoting to follower.");
      response = demoteToFollower(state, term);
      state = response.state;
      term = response.term;
      votesFor = 1;
      votesReceived = 1;
    } // startElection.reset();
  } else if (parseInt(msg.request) === 0) {
    // console.log(`my state ${state}, heartbeat from ${msg.leaderID}`);
    startElection.reset();
    //hearbeat received
    if (Object.keys(votedFor).length > 0) {
      msg.votedFor = votedFor[Object.keys(votedFor) - 1];
    } else {
      msg.votedFor = "";
    }
    // console.log(`Leader found. Demoting ${process.env.NODE_ID} to follower.`);
    if (state !== 0 && term < msg.term && term > 1) {
      console.log("New Leader found. Demoting to follower.");
      response = demoteToFollower(state, term);
    } else if (state !== 0 && term <= msg.term) {
      console.log("New Leader found. Demoting to follower.");
      response = demoteToFollower(state, term);
    }
    state = 0;
    term = msg.term;
    votesFor = 1;
    votesReceived = 1;
    clearInterval(heartbeat_timer);
    appendEntries(
      udp_server,
      msg,
      state,
      timeout,
      logs,
      entryLogs,
      logsPath,
      entryLogsPath
    );
    logs = initialize_logs(logsPath);
    entryLogs = initialize_logs(entryLogsPath);
  } else if (parseInt(msg.request) === 1 && state !== 2) {
    //RequestVote received so send vote if not leader
    let vote = sendVote(udp_server, logs, msg);
    if (vote.votedFor != -1) {
      votedFor.push(vote);
      // console.log(vote);
    }
  } else if (msg.request === "CONVERT_FOLLOWER") {
    if (state !== 0) {
      console.log("Converting to follower...");
      if (state === 2) {
        clearInterval(heartbeat_timer);
      }
      console.log("Converted to follower.");
    } else {
      console.log("Already a follower.");
    }
    state = 0;
    startElection.reset();
  } else if (msg.request === "TIMEOUT") {
    if (state !== 0) {
      console.log("Converting and timing out...");
      if (state === 2) {
        startElection.reset();
      }
      state = 0;
    }
    console.log("Timing out..");
    let res = promoteToCandidate(udp_server, logs, state, term);
    state = res.state;
    term = term + 1;
    votesFor = 1;
    votesReceived = 1;
  } else if (msg.request === "LEADER_INFO") {
    let res = {
      sender_name: `Node${process.env.NODE_ID}`,
      term: null,
      request: "LEADER_INFO",
      key: "LEADER",
      value: logs[Object.keys(logs).length - 1].leaderID,
    };
    console.log(res);
  } else if (msg.request === "SHUTDOWN") {
    if (state === 2) {
      clearInterval(heartbeat_timer);
    } else if (state === 1) {
      startElection.stop();
    } else if (state === 0) {
      startElection.stop();
    } else {
      console.log("That shouldn't be possible.");
    }
    try {
      console.log("Closing socket..");
      let res = {
        request: "node_dead",
      };
      for (var i = 1; i <= config.NODES; i++) {
        if (i != process.env.NODE_ID) {
          try {
            udp_server.send(JSON.stringify(res), 4040, `Node${i}`, () => {
              udp_server.close();
            });
          } catch (error) {
            console.log(`Node${i} is inactive`);
          }
          if (i != config.NODES) {
            udp_server = initialize_udp_socket(udp_port);
          }
        }
      }

      console.log("socket closed!");
      startElection.stop();
      // udp_server.close();
    } catch (error) {
      console.log("socket already closed/unavailable");
    }
  } else if (msg.request === "node_dead") {
    num_nodes = num_nodes - 1;
    // console.log(`Nodes active: ${num_nodes}`);
    if (num_nodes === 1) {
      response = promoteToLeader(
        udp_server,
        state,
        timeout,
        term,
        logs,
        entryLogs,
        logsPath,
        entryLogsPath
      );
      state = response.state;
      term = response.term;
      state_table = initialize_state_table(logs, entryLogs);
      console.log(JSON.stringify(state_table));
      votesFor = 1;
      votesReceived = 1;
      clearInterval(heartbeat_timer);
      heartbeat_timer = setInterval(
        heartbeat,
        config.TIME_PERIOD,
        udp_server,
        state,
        timeout,
        term,
        logs,
        entryLogs,
        logsPath,
        entryLogsPath
      );
      startElection.stop();
    }
  } else if (msg.request == "RETRIEVE") {
    if (state !== 2) {
      let res = {
        sender_name: `Node${process.env.NODE_ID}`,
        term: null,
        request: "LEADER_INFO",
        key: "LEADER",
        value: logs[Object.keys(logs).length - 1].leaderID,
      };
      console.log(res);
      try {
        udp_server.send(JSON.stringify(res), 4040, `Controller`);
      } catch (error) {
        console.log(`Controller is inactive`);
      }
    } else {
      let commited_logs = initialize_logs(entryLogsPath);
      let res = {
        sender_name: `Node${process.env.NODE_ID}`,
        term: null,
        request: "RETRIEVE",
        key: "COMMITED_LOGS",
        value: commited_logs,
      };
      console.log(res);
      try {
        udp_server.send(JSON.stringify(res), 4040, `Controller`);
      } catch (error) {
        console.log(`Controller is inactive`);
      }
    }
  } else if (msg.request == "STORE") {
    console.log(`STORE REQUEST: ${JSON.stringify(msg)}`);
    if (state !== 2) {
      let res = {
        sender_name: `Node${process.env.NODE_ID}`,
        term: null,
        request: "LEADER_INFO",
        key: "LEADER",
        value: logs[Object.keys(logs).length - 1].leaderID,
      };
      console.log(res);
      try {
        udp_server.send(JSON.stringify(res), 4040, `Controller`);
      } catch (error) {
        console.log(`Controller is inactive`);
      }
    } else {
      let res = {
        sender_name: `Node${process.env.NODE_ID}`,
        request: 0, //AppendRPC
        term: term,
        key: null,
        value: null,
        prevLogIndex: -1, //Object.keys(logs).length,
        prevLogTerm: -1,
        commitIndex: -1,
        entry: null,
        leaderID: process.env.NODE_ID,
        heartbeat: config.TIME_PERIOD,
      };
      if (Object.keys(logs).length > 0) {
        res.prevLogIndex = logs[Object.keys(logs).length - 1].prevLogIndex + 1;
        res.prevLogTerm = logs[Object.keys(logs).length - 1].prevLogTerm;
        res.commitIndex = logs[Object.keys(logs).length - 1].commitIndex;
        if (Object.keys(entryLogs).length > 0 && res.commitIndex !== -1) {
          res.prevLogTerm = entryLogs[res.commitIndex].Term;
        }
      }
      res.entry = { Term: term, Key: msg.key, Value: msg.value };
      res.timeout = timeout;
      logs.push(res);
    }
  } else if (msg.request == "APPEND_REPLY") {
    // console.log(`APPEND_REPLY: ${JSON.stringify(msg)}`);
    if (state == 2) {
      var nextIndex = state_table[msg.sender_name].nextIndex;
      if (nextIndex < msg.commitIndex + 1) {
        nextIndex = msg.commitIndex + 1;
      }
      state_table[msg.sender_name] = {
        nextIndex: nextIndex,
        matchIndex: msg.commitIndex,
      };
    }
    // console.log(`state table: ${JSON.stringify(state_table)}`);
  }
});

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
