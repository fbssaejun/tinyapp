//Libraries, imports and global variables
const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10);
const {generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');

//Middleware function usage
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set("view engine", "ejs");

//Databases
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

/* *** Post / Get request handlers *** */

//Get request from root path
app.get("/", (req, res) => {
  res.send("Hello!");
});

//Registration requests
app.post("/register", (req, res) => {
  const userId = generateRandomString(8);
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  if (!userEmail || !userPassword) {
    return res.status(400).send("<html><title>Registration Error</title><body><h3>Please fill in all the information for registration!</body></html>");
  } else if (getUserByEmail(userEmail, users)) {
    return res.status(400).send("<html><title>Registration Error</title><body><h3>This email already exists !</body></html>");
  }

  users[userId] = {
    id: userId,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, salt)
  };

  req.session.userId = userId;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("register", templateVars);
});

//Login requests
app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userId = getUserByEmail(userEmail, users);

  if (!userId) {
    return res.status(403).send("<html><script>setTimeout(() => { window.location.href='/login'}, 3000)</script><title>Login Error</title><body><h3>Sorry, Email does not exist. Please try again.</body></html>");
  } else if (!bcrypt.compareSync(userPassword, users[userId].password)) {
    return res.status(403).send("<html><script>setTimeout(() => { window.location.href='/login'}, 3000)</script><title>Login Error</title><body><h3>Sorry, Password is invalid. Please check your password</body></html>");
  }

  req.session.userId = userId;
  res.redirect('/urls');

});

//Logout request
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//Url requests from index page
app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { urls: urlsForUser(userId, urlDatabase), user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const longURL = req.body["longURL"];
  const userId = req.session.userId;
  const date = new Date().toDateString()
  urlDatabase[shortURL] =  {longURL : longURL, userId : userId, date};
  res.redirect(`/urls/${shortURL}`);
});

//Get request from new url submission
app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  if (!templateVars.user) {
    return res.status(400).redirect('/urls');
  }
  res.render("urls_new", templateVars);
});

//Short URL Requests
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.userId;
  const user = users[userId];
  const urlObject = urlDatabase[shortURL];
  if (user) {
    if (urlObject  && userId === urlObject.userId) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    } else {
      res.send("<html><title>Access Error</title><body><h3>You cannot access this url</body></html>");
    }
  } else {
    res.send("<html><title>Access Error</title><body><h3>Please login to delete url</body></html>");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const date = urlDatabase[shortURL].date
  const userId = req.session.userId;
  const user = users[userId];
  const urlObject = urlDatabase[shortURL];
  const templateVars = { shortURL, longURL, user , date};
  if(user) {
    if(urlObject  && userId === urlObject.userId) {
    return res.render("urls_show", templateVars);
    } 
  }else {
    res.send("<html><title>Access Error</title><body><h3>Please login first.</body></html>")
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  const userId = req.session.userId;
  const date = urlDatabase[shortURL].date
  urlDatabase[shortURL] = {longURL : longURL, userId: userId, date};
  res.redirect("/urls");
});

//Get request for final shortened url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL].longURL) {
    res.status(404).send("<html><title>Invalid URL</title><body><h3>Short URL code does not exist. Check existing short URLs.</body></html>");
  } else {
    res.redirect(urlDatabase[shortURL].longURL);
  }
});

//Listens and reacts to specific PORT number
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
