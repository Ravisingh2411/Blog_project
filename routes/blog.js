const { Router } = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../public/uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage });

// Add New Blog Page
router.get("/add-new", (req, res) => {
    return res.render("addblog", {
        user: req.user,
    });
});

// Single Blog Page
router.get("/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");

        const comments = await Comment.find({
            blogId: req.params.id,
        }).populate("createdBy");

        return res.render("blog", {
            user: req.user,
            blog,
            comments,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Add Comment
router.post("/comment/:blogId", async (req, res) => {
    try {
        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,
        });

        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (err) {
        console.error(err);
        return res.status(500).send("Internal Server Error");
    }
});

// Create Blog
router.post("/", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, body } = req.body;

        if (!req.file) {
            return res.status(400).send("Please upload a cover image.");
        }

        const blog = await Blog.create({
            title,
            body,
            createdBy: req.user._id,
            coverImageURL: `/uploads/${req.file.filename}`,
        });

        return res.redirect(`/blog/${blog._id}`);
    } catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
});

module.exports = router;