const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { request } = require("express");
app.use(bodyParser.urlencoded({extended: true}));


app.use(cookieParser());


function generateRandomString() {
  return "Yu57Ix";

};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const longURL = req.body.longURL;
  urlDatabase.shortURL = longURL;
  
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`)
});

app.set("view engine", "ejs");

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});



app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username',req.body.username);
  res.redirect("/urls");
})

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.get("/u/:shortURL", (req, res) => {
  templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});


app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  templateVars = { 
    username: req.cookies["username"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});