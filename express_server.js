const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const { request } = require("express");

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// setting the template engine
app.set("view engine", "ejs");

// generate a random string.
function generateRandomString() {
  let newString = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 7; i++) {
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return newString;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// --- helper functions
const addUser = (email, password) => {
  const id = generateRandomString();
  users[id] = {
    id,
    email,
    password,
  };
  return id;
};

const checkRegistration = (email, password) => {
  if (email && password) {
    return true;
  }
  return false;
};

const checkEmail = (email) => {
  return Object.values(users).find((user) => user.email === email);
};

// --- example routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});

// --- /register
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!checkRegistration(email, password)) {
    res.status(400).send("Missing email and/or password.");
  } else if (checkEmail(email)) {
    res.status(400).send("This email has already been registered");
  } else {
    const user_id = addUser(email, password);
    res.cookie("user_id", user_id);
    console.log(users);
    res.redirect("/urls");
  }
});

// --- / url routes
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  console.log(users[req.cookies["user_id"]])
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars)

});
  // --- adding login/ logout routes

app.get("/login", (req, res) => {
    const templateVars = {
      user: users[req.cookies["user_id"]],
    };
    res.render("urls_login", templateVars);
  });
app.post("/login", (req, res) => {
for (let user in users) {
  if (req.body.email === users[user].email && req.body.password === users[user].password) {
    res.cookie("user_id", users[user].id); 
    res.redirect("/urls");   
    return;
  }
  console.log("user email: ", users[user].email);
}
  res.redirect("/login");
});


app.post("/logout", (req, res) => {
      res.clearCookie("user_id");
      res.redirect("/urls");
    });

    // --- setting post url routes.
app.post("/urls", (req, res) => {
      console.log(req.body);
      const longURL = req.body.longURL;
      urlDatabase.shortURL = longURL;
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = longURL;
      console.log(urlDatabase);
      res.redirect(`/urls/${shortURL}`);
    });

app.post("/urls/:shortURL/delete", (req, res) => {
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      res.redirect("/urls");
    });
app.post("/urls/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    urlDatabase[shortURL] = longURL;
    res.redirect(`/urls/${shortURL}`);
  });

// --- listening to port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
