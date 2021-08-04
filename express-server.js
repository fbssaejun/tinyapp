const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const alert = require('alert');
const bcrypt = require('bcrypt');
const {generateRandomString, checkEmail} = require('./helper-functions');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/register", (req, res) => {
  const userId = generateRandomString(8);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.status(400);
    alert("Please fill in all the information for registration!");
    // res.redirect("/register");
  } else if (checkEmail(userEmail, users)) {
    res.status(400);
    alert("This email already exists.");
    return res.redirect("/register");
  }

  users[userId] = {
    id: userId,
    email: userEmail,
    password: userPassword
  };

  res.cookie("userId", userId);
  res.redirect("/urls");

});

app.get("/login", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userId = checkEmail(userEmail, users);
  if (!userId) {
    console.log("Sorry, Email does not exist. Try again.");
    return res.status(403).redirect("/login");
  } else if (userPassword !== users[userId].password) {
    console.log("Sorry, Password is invalid.");
    return res.status(403).redirect("/login");
  }
  
  res.cookie("userId", userId);
  res.redirect('/urls');

});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body["longURL"];
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body["longURL"];
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userId = req.cookies.userId;
  const user = users[userId];
  const templateVars = { shortURL, longURL, user};
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404);
    res.send(`Short URL code does not exist. Check existing short URLs.`);
  } else {
    res.redirect(urlDatabase[shortURL]);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
