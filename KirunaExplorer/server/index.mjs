// imports
import "./db/db.mjs";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import LocalStrategy from "passport-local";
import routes from "./routes/routes.mjs"; // Import the routes module
import { getUser } from "./dao/user-dao.mjs";
import dotenv from "dotenv";


//DAO
// const documentDao = new DocumentDAO();
dotenv.config();

// init express
const app = express();
const port = 3001;

app.use(express.json());
app.use(morgan("dev"));

// Configurazione CORS
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  optionsSuccessStatus: 200,
  credentials: true,
};

app.use(cors(corsOptions));

// Configurazione Passport
passport.use(
  new LocalStrategy(async function verify(username, password, cb) {
    try {
      const user = await getUser(username, password);
      if (!user) {
        return cb(null, false, { message: "Incorrect username or password." });
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  cb(null, user);
});

app.use(
  session({
    secret: "cambiato il secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

// Use the routes.js
app.use(routes);

//PASSPORT API
app.post("/api/sessions", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).send(info.message);
    }
    req.login(user, (err) => {
      if (err) return next(err);
      return res.status(201).json(req.user);
    });
  })(req, res, next);
});

app.get("/api/sessions/current", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  } else {
    res.status(401).json({ error: "Not authenticated" });
  }
});

app.delete("/api/sessions/current", (req, res) => {
  req.logout(() => {
    res.end();
  });
});

// activate the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

export default app;
