const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const salt = bcrypt.genSaltSync(10)
const {generateRandomString, checkEmail, urlsForUser} = require('./helper-functions');


app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

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
    return res.status(400).send("<html><title>Registration Error</title><body><h3>Please fill in all the information for registration!</body></html>");
  } else if (checkEmail(userEmail, users)) {
    return res.status(400).send("<html><title>Registration Error</title><body><h3>This email already exists !</body></html>")
  }

  users[userId] = {
    id: userId,
    email: userEmail,
    password: bcrypt.hashSync(userPassword, salt)
  };

  req.session.userId = userId;
  res.redirect("/urls");

});

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;
  const userId = checkEmail(userEmail, users);
 

  if (!userId) {
    return res.status(403).send("<html><script>setTimeout(() => { window.location.href='/login'}, 3000)</script><title>Login Error</title><body><h3>Sorry, Email does not exist. Please try again.</body></html>");
  } else if ( !bcrypt.compareSync(userPassword, users[userId].password)) {
    return res.status(403).send("<html><script>setTimeout(() => { window.location.href='/login'}, 3000)</script><title>Login Error</title><body><h3>Sorry, Password is invalid. Please check your password</body></html>");
  }

  // res.cookie("userId", userId);
  req.session.userId = userId
  res.redirect('/urls');

});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

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
  urlDatabase[shortURL] =  {longURL : longURL, userId : userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.userId;
  const user = users[userId];
  const urlObject = urlDatabase[shortURL];
  if(user) {
    if(urlObject  && userId === urlObject.userId) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");  
    } else {
      res.send("<html><title>Access Error</title><body><h3>You cannot access this url</body></html>");
    }
  } else {
    res.send("<html><title>Access Error</title><body><h3>Please login to delete url</body></html>") 
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  if(!templateVars.user){
    return res.status(400).redirect('/urls')
  }
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { urls: urlDatabase, user };
  res.render("register", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userId = req.session.userId;
  const user = users[userId];
  const templateVars = { shortURL, longURL, user};
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body["longURL"];
  const userId = req.session.userId;
  urlDatabase[shortURL] = {longURL : longURL, userId: userId};
  res.redirect("/urls");
});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL].longURL) {
    res.status(404);
    res.send(`Short URL code does not exist. Check existing short URLs.`);
  } else {
    res.redirect(urlDatabase[shortURL].longURL);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
