const express = require("express");
const app = express();

app.use(express.json());
require("./database/database");
const userRouter = require("./routes/userRouter");
app.use(userRouter);

app.listen(90,console.log("server is running"))