const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const alert = require("alert");
const bcrypt = require('bcrypt');
const {generateRandomString, checkEmail, urlsForUser} = require('./helper-functions');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");


const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password:  bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userId: 'aJ48lW'
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userId: "aJ48lW"
  }
};



app.post("/register", (req, res) => {
  const userId = generateRandomString(8);
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.status(400);
    alert("Please fill in all the information for registration!");
  } else if (checkEmail(userEmail, users)) {
    res.status(400);
    alert("This email already exists.");
    return res.redirect("/register");
  }

  users[userId] = {
    id: userId,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, 10)
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
    res.send("Sorry, Email does not exist. Please try again.");
    return res.status(403).redirect("/login");
  } else if ( !bcrypt.compareSync(userPassword, users[userId].password)) {
    res.send("Sorry, Password is invalid.");
    return res.status(403).redirect("/login");
  }
  
  res.cookie("userId", userId);
  res.redirect('/urls');

});

app.post("/logout", (req, res) => {
  res.clearCookie('userId');
  res.redirect('/urls');
});

app.get("/urls", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  const templateVars = { urls: urlsForUser(userId, urlDatabase), user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body["longURL"];
  const userId = req.cookies.userId;
  urlDatabase[shortURL] =  {longURL : longURL, userId : userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.cookies.userId;
  const user = users[userId];
  const urlObject = urlDatabase[shortURL];
  if(user) {
    if(urlObject  && userId === urlObject.userId) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");  
    } else {
      res.send("You cannot access this url");
    }
  } else {
    res.send("Please login to delete url") 
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  const userId = req.cookies.userId;
  urlDatabase[shortURL] = {longURL : longURL, userId: userId};
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  if(!templateVars.user){
    return res.status(400).redirect('/urls')
  }
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
  const longURL = urlDatabase[shortURL].longURL;
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
