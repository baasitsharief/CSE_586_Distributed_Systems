const axios = require("axios");

heartbeat = (udp_server, node_state) => {
  if (node_state === 2) {
    for (var i = 1; i < 3; i++) {
      udp_server.send(
        [`heartbeat from leader with node_id: ${process.env.NODE_ID}`],
        4040,
        `api-server-${i}`
      );
    }
    console.log(`heartbeat polled, my id: ${process.env.NODE_ID}`);
  }
};

module.exports = {
  heartbeat,
};
