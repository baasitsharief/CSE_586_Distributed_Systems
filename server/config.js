const TIME_PERIOD = 1000; //in ms
const NODES = 5;
const FOLLOWER = 0; //Follower
const CANDIDATE = 1; //Candidate
const MASTER = 2; //Master
const requests = {
  CONVERT_FOLLOWER: 3,
  TIMEOUT: 4,
  SHUTDOWN: 5,
  LEADER_INFO: 6,
};

module.exports = {
  TIME_PERIOD,
  NODES,
  FOLLOWER,
  CANDIDATE,
  MASTER,
  requests,
};
