import express from "express";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import flash from "connect-flash";
import cookieParser from "cookie-parser";
import { create } from "express-handlebars";
import session from "express-session";

import hbshelpers from "./utils/index.js";

import ProductsRouts from "./routes/products.js";
import AuthRoutes from "./routes/auth.js";

import varMiddleware from "./middleware/var.js";
import userMiddleware from "./middleware/user.js";

dotenv.config();
const app = express();
const hbs = create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: hbshelpers,
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "./views");

app.use(cookieParser());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "Sulton",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600 },
  })
);

app.use(varMiddleware);
app.use(userMiddleware);

app.use(flash());
app.use(AuthRoutes);
app.use(ProductsRouts);

const connectDB = async () => {
  console.log("start db");
  try {
    console.log("start db: ");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB muvaffaqiyatli ulandi");
  } catch (error) {
    console.error("MongoDB ulanishida xatolik:", error);
  }
  console.log("end db");
};

connectDB();

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => console.log(`Post is running:  ${PORT}`));
