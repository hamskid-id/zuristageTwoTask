require("dotenv").config();
const cors = require('cors');
const PORT = process.env.PORT || 3500;
const express = require('express');
const { verifyJWT } = require('./middleware/verifyjwt');
const cookieParser = require('cookie-parser');
const mongoose = require("mongoose");
const { connectDB } = require("./config/dbConfig");
const { errorHanlder } = require("./middleware/errorhandler");
const app = express();

connectDB();

app.use(express.urlencoded({extended :false}));

app.use(express.json());

app.use(cors());

app.use(cookieParser());

app.get('/', async (req, res) => {
    res.send("Hello there! app is running great");
});

app.use("/auth", require("./routes/auth"));

app.use(verifyJWT);
app.use("/api", require("./routes/user"));
app.use("/api", require("./routes/organisation"));

app.all('*',(req, res)=>{
  res.status(404).send("route not found");
}); 

process.on('uncaughtException', err => {
  console.log(`There was an uncaught error:${err}`);
  process.exit();
});

app.use(errorHanlder);

mongoose.connection.once('open',()=>{
  console.log('Connected to MongoDB');
  app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
  })
})