const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const db = require("./db");
const postRouter = require("./routes/post-router");

const app = express();
const port = 5000;

const isMaster = process.env.MASTER;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.get("/", (req, res) => {
  res.send("DS Phase 1 - Backend v1.0");
});

app.use("/api", postRouter);

app.listen(port, () => console.log(`Server running on ${port}`));
