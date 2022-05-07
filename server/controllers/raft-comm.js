const fs = require("fs");
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

heartbeat = (
  udp_server,
  node_state,
  timeout,
  term,
  logs,
  entryLogs,
  logsPath,
  entryLogsPath
) => {
  if (node_state === 2) {
    let msg = {
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
      let lastLog = logs[Object.keys(logs).length - 1];
      msg.prevLogIndex = lastLog.prevLogIndex;
      if (Object.keys(entryLogs).length > 0) {
        msg.prevLogTerm = entryLogs[Object.keys(entryLogs).length - 1]["Term"];
      }
      msg.commitIndex = Object.keys(entryLogs).length - 1;
      msg.entry = lastLog.entry;
    }
    for (var i = 1; i <= config.NODES; i++) {
      if (i != process.env.NODE_ID) {
        try {
          udp_server.send(JSON.stringify(msg), 4040, `Node${i}`);
        } catch (error) {
          console.log("heartbeat.error: ", error);
        }
      }
    }
    // console.log(`heartbeat polled, my id: ${process.env.NODE_ID}`);
    msg.timeout = timeout;
    if (msg.entry !== null) {
      entryLogs.push(msg.entry);
      // msg.prevLogIndex = msg.prevLogIndex;
      msg.prevLogTerm = msg.entry["Term"];
    }
    logs.push(msg);
    fs.writeFileSync(logsPath, JSON.stringify(logs), { flag: "w+" }, (err) => {
      console.log("log save failed.");
    });
    fs.writeFileSync(
      entryLogsPath,
      JSON.stringify(entryLogs),
      { flag: "w+" },
      (err) => {
        console.log("log save failed.");
      }
    );
    if (msg.entry !== null) {
      msg.commitIndex = msg.commitIndex + 1;
    }
    msg = {
      sender_name: `Node${process.env.NODE_ID}`,
      request: 0, //AppendRPC
      term: term,
      key: null,
      value: null,
      prevLogIndex: msg.prevLogIndex, //Object.keys(logs).length,
      prevLogTerm: msg.prevLogIndex,
      commitIndex: msg.commitIndex,
      entry: null,
      leaderID: process.env.NODE_ID,
      heartbeat: config.TIME_PERIOD,
    };
    logs.push(msg);
  }
};

appendEntries = (
  udp_server,
  msg,
  node_state,
  timeout,
  logs,
  entryLogs,
  logsPath,
  entryLogsPath
) => {
  if (node_state !== 2) {
    // msg = JSON.parse(msg);

    leaderID = msg.leaderID;
    // lastIndex = -1;
    // lastTerm = -1;
    // if(Object.keys(entryLogs).length>0){
    //   lastIndex = Object.keys(entryLogs).length-1;
    //   lastTerm = entryLogs[Object.keys(entryLogs).length-1]["Term"];
    // }

    msg.timeout = timeout;
    logs.push(msg);
    if (msg.entry !== null) {
      entryLogs.push(msg.entry);
    }
    fs.writeFileSync(logsPath, JSON.stringify(logs), { flag: "w+" }, (err) => {
      console.log("log save failed.");
    });
    fs.writeFileSync(
      entryLogsPath,
      JSON.stringify(entryLogs),
      { flag: "w+" },
      (err) => {
        console.log("log save failed.");
      }
    );
    let res = {
      sender_name: `Node${process.env.NODE_ID}`,
      request: "APPEND_REPLY", //AppendReply
      term: msg.term,
      key: null,
      value: false,
      prevLogIndex: -1, //Object.keys(logs).length,
      prevLogTerm: -1,
      commitIndex: -1,
    };
    if (Object.keys(logs).length > 0) {
      res.prevLogIndex = logs[Object.keys(logs).length - 1].prevLogIndex;
      res.prevLogTerm = logs[Object.keys(logs).length - 1].prevLogTerm;
      res.commitIndex = Object.keys(entryLogs).length - 1;
      res.entry = logs[Object.keys(logs).length - 1].entry;
    }
    if (msg.commitIndex == res.commitIndex) {
      res.value = true;
    }
    try {
      udp_server.send(JSON.stringify(res), 4040, `Node${leaderID}`);
    } catch (error) {
      console.log("appendReply.error: ", error);
    }
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
    prevLogIndex: 0,
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
        console.log("requestVote.error: ", error);
      }
    }
  }
};

sendVote = (udp_server, logs, msg) => {
  let candidateID = msg.candidateID;
  let lastIndex = msg.prevLogIndex;
  let lastTerm = msg.term;
  let lastLog = {
    term: 0,
    prevLogIndex: 0,
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
    parseInt(lastIndex) >= parseInt(lastLog.prevLogIndex)
  ) {
    vote_msg.vote = true;
    votedFor = candidateID;
  }
  try {
    udp_server.send(JSON.stringify(vote_msg), 4040, `Node${candidateID}`);
  } catch (error) {
    console.log("sendVote.error: ", error);
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

promoteToLeader = (
  udp_server,
  node_state,
  timeout,
  term,
  logs,
  entryLogs,
  logsPath,
  entryLogsPath
) => {
  console.log(`${process.env.NODE_ID} made leader`);
  node_state = 2;
  term = parseInt(term);
  heartbeat(
    udp_server,
    node_state,
    timeout,
    term,
    logs,
    entryLogs,
    logsPath,
    entryLogsPath
  );
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
