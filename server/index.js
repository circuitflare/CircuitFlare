const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");
const path = require('path')
const dotenv = require("dotenv");
dotenv.config();

if(process.env.NODE_ENV !== "PRODUCTION"){
  const dotenv = require('dotenv')
  dotenv.config()
}

//db connection
const connection = require("./database/connection")
connection();

//middleware require
const errorMiddleware = require("./middleware/error");

//handling uncaught errors
process.on("uncaughtException", (err) => {
  console.log(`ERROR : ${err.message}`);
  console.log("Shutting down the server due to uncaught exception");
  process.exit(1);
});

//routes import
const user = require('./routes/userRoutes');
const order = require('./routes/orderRoutes')
const admin = require('./routes/adminRoutes')

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use('/api/user',user);
app.use('/api/order',order);
app.use('/api/admin',admin);

//error middleware
app.use(errorMiddleware);

const port = process.env.PORT || 4000;

// app.use(express.static(path.join(__dirname , '../client/build')));

// app.get('*' , (req,res) => {
//     res.sendFile(path.resolve(__dirname , '../client/build/index.html'))
// })

app.get("/",(req,res)=>{
  res.send("Circuit Flare Backend")
})


app.listen(port, () => {
  console.log(`Server running on port : ${port}`);
});
