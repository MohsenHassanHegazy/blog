"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const post_1 = __importDefault(require("./routes/post"));
const auth_1 = __importDefault(require("./routes/auth"));
const connect_mongodb_session_1 = __importDefault(require("connect-mongodb-session"));
const express_session_1 = __importDefault(require("express-session"));
const user_1 = __importDefault(require("./models/user"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const multer_1 = __importDefault(require("multer"));
const csurf_1 = __importDefault(require("csurf"));
const MongoDBStore = (0, connect_mongodb_session_1.default)(express_session_1.default);
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
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
app.use((0, express_session_1.default)({
    secret: "myNewSecret",
    resave: false,
    saveUninitialized: false,
    store: store,
}));
let dat2 = new Date().toISOString().replace(":", "-");
let dat = dat2.replace(":", "-");
dat += "-";
dat2 = dat.split("T")[0];
console.log(dat2);
const fileStore = multer_1.default.diskStorage({
    destination(req, file, callback) {
        callback(null, "images");
    },
    filename(req, file, callback) {
        callback(null, dat2 + file.originalname);
    },
});
const crtf = (0, csurf_1.default)();
app.use((0, multer_1.default)({ storage: fileStore }).single("image"));
app.use(crtf);
app.use((req, res, next) => {
    res.locals.isLogedIn = req.session.isLogedIn;
    res.locals.isAdmin = req.session.isAdmin;
    res.locals.logedUserId = req.session.logedUserId;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.session.user) {
        return next();
    }
    const user = yield user_1.default.findById(req.session.user._id);
    if (!user) {
        return next();
    }
    req.session.user = user;
    req.session.logedUserId = user._id.toString();
    next();
}));
//app.use(bodyParser.urlencoded({ extended: false }));
app.use((0, connect_flash_1.default)());
app.use(express_1.default.json());
//app.use(bodyParser.json());
app.use(auth_1.default);
app.use(post_1.default);
app.use("/css", express_1.default.static("./css/"));
app.use("/images", express_1.default.static("./images/"));
mongoose_1.default.connect(URI).then((result) => {
    app.listen(3000);
});
// app.listen(3000);
