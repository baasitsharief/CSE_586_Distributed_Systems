// import process from "process";

const mongoose = require("mongoose");

const connectionString = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/feed`;

mongoose.connect(connectionString, { useNewUrlParser: true }).catch((e) => {
  console.error("Connection error", e.message);
});

const db = mongoose.connection;

module.exports = db;
