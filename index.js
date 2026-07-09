const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");

const app = express();
const PORT = 8000;

mongoose.connect("mongodb://127.0.0.1:27017/blogify")
.then(() => console.log("Database connected"))
.catch((err) => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"))

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => console.log(`Server is running on: ${PORT}`));