const fs = require("fs");
const { markAsUntransferable } = require("worker_threads");
const config = require("../config");

function Timer(fn, t, ...args) {
  //Timer object: https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer
  var timerObj = setTimeout(fn, t, ...args);

  this.stop = function () {
    if (timerObj) {
      clearTimeout(timerObj);
      timerObj = null;
    }
    return this;
  };

  // start timer using current settings (if it's not already running)
  this.start = function () {
    if (!timerObj) {
      this.stop();
      timerObj = setTimeout(fn, t, ...args);
    }
    return this;
  };

  // start with new or original interval, stop current interval
  this.reset = function (newT = t) {
    t = newT;
    return this.stop().start();
  };
}

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

heartbeat = (udp_server, node_state, timeout, term, logs, filePath) => {
  if (node_state === 2) {
    let msg = {
      request: 0, //AppendRPC
      lastIndex: 0, //Object.keys(logs).length,
      command: "",
      term: term,
      leaderID: process.env.NODE_ID,
      heartbeat: config.TIME_PERIOD,
    };
    for (var i = 1; i <= config.NODES; i++) {
      if (i != process.env.NODE_ID) {
        try {
          udp_server.send(JSON.stringify(msg), 4040, `Node${i}`);
        } catch (error) {
          console.log(error);
        }
      }
    }
    // console.log(`heartbeat polled, my id: ${process.env.NODE_ID}`);
    msg.timeout = timeout;
    logs.push(msg);
    fs.writeFileSync(filePath, JSON.stringify(logs), { flag: "w+" }, (err) => {
      console.log("log save failed.");
    });
  }
};

appendEntries = (msg, node_state, timeout, logs, logfile) => {
  if (node_state !== 2) {
    // msg = JSON.parse(msg);
    msg.timeout = timeout;
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
  // console.log(`requesting vote for ${process.env.NODE_ID}`);
  let msg = {
    lastIndex: 0,
  };
  if (Object.keys(logs).length > 0) {
    msg = logs[Object.keys(logs).length - 1];
  }
  msg.request = 1; //requestVote
  msg.candidateID = process.env.NODE_ID;
  msg.term = term;
  for (var i = 1; i <= config.NODES; i++) {
    if (i != process.env.NODE_ID) {
      try {
        udp_server.send(JSON.stringify(msg), 4040, `Node${i}`);
      } catch (error) {
        console.log(error);
      }
    }
  }
};

sendVote = (udp_server, logs, msg) => {
  let candidateID = msg.candidateID;
  let lastIndex = msg.lastIndex;
  let lastTerm = msg.term;
  let lastLog = {
    term: 0,
    lastIndex: 0,
  };
  if (Object.keys(logs).length > 0) {
    lastLog = logs[Object.keys(logs).length - 1];
  }
  // console.log(
  //   `sending vote to ${candidateID}, msg: ${JSON.stringify(
  //     msg
  //   )}, last log: ${JSON.stringify(lastLog)}`
  // );
  let votedFor = -1;
  let vote_msg = {
    request: 2, //Vote
    vote: false,
    voterID: process.env.NODE_ID,
    // voterState: state,
  };
  if (
    parseInt(lastTerm) >= parseInt(lastLog.term) &&
    parseInt(lastIndex) >= parseInt(lastLog.lastIndex)
  ) {
    vote_msg.vote = true;
    votedFor = candidateID;
  }
  try {
    udp_server.send(JSON.stringify(vote_msg), 4040, `Node${candidateID}`);
  } catch (error) {
    console.log(error);
  }
  return { votedFor: votedFor, term: lastTerm };
};

promoteToCandidate = (udp_server, logs, node_state, term) => {
  console.log(
    `${process.env.NODE_ID} promoted to candidate. Starting election..`
  );
  // console.log(`before promotion state: ${node_state}, term: ${term}`);
  node_state = 1;
  term = parseInt(term) + 1;
  // console.log(`after promotion state: ${node_state}, term: ${term}`);
  // let lastLog = logs[Object.keys(logs).length-1];
  requestVote(udp_server, logs, term);
  return { state: node_state };
};

demoteToFollower = (node_state, term) => {
  console.log(`${process.env.NODE_ID} demoted to follower`);
  node_state = 0;
  term = term - 1;
  return { state: node_state, term: term };
};

promoteToLeader = (udp_server, node_state, timeout, term, logs, filePath) => {
  console.log(`${process.env.NODE_ID} made leader`);
  node_state = 2;
  term = parseInt(term);
  heartbeat(udp_server, node_state, timeout, term, logs, filePath);
  return { state: node_state, term: term };
};

// compareLogs = (msg, lastLog) => {};

module.exports = {
  Timer,
  heartbeat,
  requestVote,
  initialize_logs,
  appendEntries,
  sendVote,
  // compareLogs,
  promoteToCandidate,
  demoteToFollower,
  promoteToLeader,
};
