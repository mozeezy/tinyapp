const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcryptjs');
const {getUserByEmail}= require('./helpers');
// const { request } = require("express");

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(
  cookieSession({
    name: 'session',
    keys: ['B&E)H@McQfTjWnZr4t7w!z%C*F-JaNdR', '!A%D*G-KaPdSgUkXp2s5v8y/B?E(H+Mb'],
  })
);

// setting the template engine
app.set("view engine", "ejs");

// generate a random string.
function generateRandomString() {
  let newString = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    newString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return newString;
}

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
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
  const hashedPass = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashedPass,
  };
  return id;
};

const checkRegistration = (email, password) => {
  if (email && password) {
    return true;
  }
  return false;
};



const urlsForUser = (id) => {
  let filter = {};
  const database = Object.keys(urlDatabase)
  for (let urlID of database) {
    if (urlDatabase[urlID].userID === id) {
      filter[urlID] = urlDatabase[urlID];
    }
  }
  return filter;
};

const allUrls = function() {
  let urls = {};
  for (let shortUrl in urlDatabase) {
    urls[shortUrl] = urlDatabase[shortUrl].longURL
  }
  return urls;
}

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
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!checkRegistration(email, password)) {
    res.status(400).send("Missing email and/or password.");
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("This email has already been registered");
  } else {
    const user_id = addUser(email, password);
    req.session.user_id = user_id;
    res.redirect("/urls");
  }
});

// --- / url routes
app.get("/u/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]) {
    return res.send("Broken link");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const cookie = req.session.user_id;
  // if (cookie == null) {
  //   return res.redirect("/login");
  // } 
  let userURL = {};
  if (cookie != null) {
    userURL = urlsForUser(cookie);
  } else {
    userURL = allUrls();
  }
  const templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)  
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_login", templateVars);
  }

});

app.get("/urls/:shortURL", (req, res) => {
  const cookie = req.session.user_id;
  if (cookie == null) {
    return res.redirect("/login");
  }; 
  const userID = req.session['user_id'];
  const userURLS = urlsForUser(userID);
  const templateVars = { urls: userURLS, 
    user: users[req.session.user_id], 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  if (req.session.user_id === urlDatabase[templateVars.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(400).send("Access Denied: The link does not belong to this user.");
  }
});
  // --- adding login/ logout routes

app.get("/login", (req, res) => {
    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_login", templateVars);
  });
app.post("/login", (req, res) => {
for (let user in users) {
  if (req.body.email === users[user].email && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id; 
    res.redirect("/urls");   
    return;
  } 
  res.send("Wrong credentials!")
}
  res.redirect("/login");
});


app.post("/logout", (req, res) => {
      req.session = null;
      res.redirect("/urls");
    });

    // --- setting post url routes.
app.post("/urls", (req, res) => {
      const longURL = req.body.longURL;
      const shortURL = generateRandomString();
      urlDatabase[shortURL] = {
        longURL,
        userID: req.session.user_id
      };
      res.redirect(`/urls/${shortURL}`);
    });

app.post("/urls/:shortURL/delete", (req, res) => {
  const cookie = req.session.user_id;
  if (cookie == null) {
    return res.redirect("/login");
  }; 
  const shortURL = req.params.shortURL;
  const userUrl = urlsForUser(cookie);
  for (let shorturl in userUrl) {
    if (shorturl == shortURL) {
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    } 
  } 
  // if (req.cookies["user_id"] === urlDatabase[shortURL].userID) {
  //   delete urlDatabase[req.params.shortURL];
  //   res.redirect("/urls");
  // } else {
  //   res.status(400).send("You must be logged in to delete that link.");
  // }
});

app.post("/urls/:shortURL", (req, res) => {
  
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    if (req.session.user_id === urlDatabase[shortURL].userID) {
      urlDatabase[shortURL].longURL = longURL;
      res.redirect(`/urls/${shortURL}`);
    } else {
      res.status(400).send("You must be logged in to edit that link!")
    }
  });

// --- listening to port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
