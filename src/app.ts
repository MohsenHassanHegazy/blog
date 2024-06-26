import bodyParser from "body-parser";
import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { Server } from "socket.io";
import socket from "./socket";
import mongoose from "mongoose";
import adminRoutes from "./routes/post";
import authRoutes from "./routes/auth";
import { default as connectMongoDBSession } from "connect-mongodb-session";
import session from "express-session";
import User from "./models/user";
import flash from "connect-flash";
import multer from "multer";
import path from "path";
import {
  expressCspHeader,
  INLINE,
  NONE,
  SELF,
  UNSAFE_INLINE,
} from "express-csp-header";
import csurf from "csurf";

const MongoDBStore = connectMongoDBSession(session);

const app = express();
app.use(express.urlencoded({ extended: true }));

let URI = process.env.mongodbkey;
if (!URI) {
  URI = "no key";
}
// console.log(URI);
const store = new MongoDBStore({
  uri: URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
// app.set('views','views');

app.use(
  session({
    secret: "myNewSecret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

interface I {
  name: string;
  avatar: string;
  email: string;
  token: number;
  tokenDate: Date;
  validEmail: boolean;
  password: string;
  posts: object[];
  comments: object[];
  likedPosts: object[];
  likedComments: Comment[];
  dislikedPosts: object[];
  dislikedComments: Comment[];
  isadmin: boolean;
  banDate: Date;
}

interface IUser extends I {
  _doc: any;
  _id: any;
}

declare module "express-session" {
  interface SessionData {
    user: IUser;
    logedUserId: string;
    isLogedIn: boolean;
    isAdmin: boolean;
    validEmail: boolean;
  }
}

let dat2 = new Date().toISOString().replace(":", "-");
let dat = dat2.replace(":", "-");
dat += "-";
dat2 = dat.split("T")[0];
console.log(dat2);

const fileStore = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, "images");
  },
  filename(req, file, callback) {
    callback(null, dat2 + file.originalname);
  },
});

const crtf = csurf();
app.use(multer({ storage: fileStore }).single("image"));
app.use(crtf);
app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.isLogedIn = req.session.isLogedIn;
    res.locals.isAdmin = req.session.isAdmin;
    res.locals.logedUserId = req.session.logedUserId;
    res.locals.csrfToken = req.csrfToken();
    next();
  }
);

app.use(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!req.session.user) {
      return next();
    }
    const user = await User.findById(req.session.user._id);
    if (!user) {
      return next();
    }
    req.session.user = user;
    req.session.logedUserId = user._id.toString();
    next();
  }
);
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(flash());
app.use(express.json());

//app.use(bodyParser.json());

app.use(authRoutes);
app.use(adminRoutes);
app.use("/css", express.static("./css/"));
app.use("/images", express.static("./images/"));
app.use("/views/js", express.static("./views/js"));

mongoose.connect(URI).then((result) => {
  // app.listen(3000);
  const server = createServer(app);
  const io = socket.init(server);

  io.on("connection", (socket) => {
    console.log("a user connected");
  });

  server.listen(3000, () => {
    console.log("listening on *:3000");
  });
});
// app.listen(3000);
