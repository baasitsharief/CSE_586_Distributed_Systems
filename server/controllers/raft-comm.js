const axios = require("axios");
const fs = require("fs");

initialize_logs = (filePath) => {
  var logs = [];
  if (fs.existsSync(filePath)) {
    var logfile = fs.readFileSync(filePath);
    logs = JSON.parse(logfile);
  } else {
    fs.writeFileSync(filePath, "[]", { flag: "w+" });
    var logfile = fs.readFileSync(filePath);
    logs = JSON.parse(logfile);
  }
  return logs;
};

heartbeat = (udp_server, node_state, term, logs, filePath) => {
  if (node_state === 2) {
    let msg = {
      type: 0, //AppendRPC
      lastIndex: Object.keys(logs).length,
      command: "",
      term: term,
      leaderID: process.env.NODE_ID,
    };
    logs.push(msg);
    for (var i = 0; i < 3; i++) {
      if (i != process.env.NODE_ID) {
        udp_server.send(JSON.stringify(msg), 4040, `api-server-${i}`);
      }
    }
    console.log(`heartbeat polled, my id: ${process.env.NODE_ID}`);
    fs.writeFileSync(filePath, JSON.stringify(logs), { flag: "w+" }, (err) => {
      console.log("log save failed.");
    });
  }
};

appendEntries = (msg, node_state, logs, logfile) => {
  if (node_state !== 2) {
    // msg = JSON.parse(msg);
    logs.push(msg);
    fs.writeFileSync(logfile, JSON.stringify(logs), { flag: "w+" }, (err) => {
      console.log("log save failed.");
    });
  }
};

// requestVote;

// heartbeatCheck = (udp_server, timeout, node_state) => {
//   if (node_state === 0) {
//   }
// };

requestVote = (udp_server, logs, term) => {
  let msg = logs[Object.keys(logs).length - 1];
  msg.type = 1; //requestVote
  for (var i = 0; i < 3; i++) {
    if (i != process.env.NODE_ID) {
      udp_server.send(JSON.stringify(msg), 4040, `api-server-${i}`);
    }
  }
};

sendVote = (udp_server, logs, msg) => {
  let candidateID = msg.leaderID;
};

promoteToCandidate = (logs, node_state) => {
  node_state = 1;
};

compareLogs = (msg, lastLog) => {};

module.exports = {
  heartbeat,
  requestVote,
  initialize_logs,
  appendEntries,
  sendVote,
  compareLogs,
};
