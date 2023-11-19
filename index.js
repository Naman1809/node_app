// // const http = require("http");
// import http from "http";
// import {getfunc} from "./features.js";
// import fs from "fs";
// // import vari1 from "./features.js";
// // import {vari3,vari2} from "./features.js"
// // console.log(vari1);
// // console.log(vari2);

// const home = fs.readFileSync("./index.html")

// const server=http.createServer((req,res)=>{
// if(req.url==="/"){
//     res.end(home)

// }
// else if(req.url==="/about"){
//     res.end(`<h1>You answer is ${getfunc()}</h1>`)

// }else if(req.url==="/contact"){
// res.end("contact")
// }
// else{
//     res.end("page not found")
// }
// })
// server.listen(5000,()=>{
//     console.log('Server is working');
// })

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const app = express();
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

// using middlewares
// this is the middleware used to acess static files
app.use(express.static(path.join(path.resolve(), "public")));
// this is used to acess the data submitted in form or in url in post reqeuest

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

const users = [];
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decoded = jwt.verify(token, "gnrwobgoogrwogr");
    req.user = await User.findById(decoded._id);
    next();
  } else {
    res.redirect("login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  // res.json({
  //     success:true,
  //     products:[]
  // })
  // const pathlocation

  // we get the directory by using path.resolve() function
  // res.sendFile(path.join(path.resolve(),"./index.html"))

  // either to specify the expenison here or have a gerneal exptenion upwwards in set
  // console.log(req.user)

  res.render("logout", { name: req.user.name });
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.redirect("/register");
  const isMatch = await bcrypt.compare(password,user.password);
  if (!isMatch)
    return res.render("login", { email, message: "Incorrect Password" });
  const token = jwt.sign({ _id: user._id }, "gnrwobgoogrwogr");
  // console.log(token);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  // console.log(req.body)
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
  const hashedPassword= await bcrypt.hash(password,10);

  user = await User.create({
    name,
    email,
    password:hashedPassword,
  });

  const token = jwt.sign({ _id: user._id }, "gnrwobgoogrwogr");
  // console.log(token);
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "", {
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// app.get("/add", async (req, res) => {
//   await Message.create({ name: "Naman", email: "hello@gmail.com" });
//   res.send("Nice");
// });

// app.get("/success", (req, res) => {
//   res.render("success");
// });

// app.get("/users", (req, res) => {
//   res.json({
//     users,
//   });
// });
// app.post("/contact", async (req, res) => {
//   // const userData={name:req.body.name, email:req.body.email};
//   const { name, email } = req.body;
//   // if key value pair is same you can write either like the name one or like the email one
//   await Message.create({ name, email: email });
//   res.redirect("/success");
// });

app.listen(5000, () => {
  console.log("Server is Working");
});
