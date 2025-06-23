// importing all modules
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import requestIp from "request-ip";

// importing all files
import authMiddleware from "./middlewares/auth.middleware.js";
import authRoute from "./routes/auth.route.js";

// creating app
const app = express();

// all middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());

app.use(cookieParser());
app.use(
  session({ secret: "my-secret", resave: true, saveUninitialized: false })
);
app.use(flash());

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "..", "client", "views"));
app.use(
  express.static(path.join(import.meta.dirname, "..", "client", "public"))
);

// all custom middlewares
app.use(authMiddleware);
app.use((req, res, next) => {
  res.locals.user = req.user;
  return next();
});

// creating all routes
app.use("/", authRoute);

app.get("/", (req, res) => {
  res.status(200).render("index");
});

// handling routes not exist
app.use("/", (req, res) => {
  return res.status(404).render("pageNotFound");
});

// exporting app
export default app;
