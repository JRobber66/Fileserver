const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const UPLOAD_DIR = "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// memory metadata store (temporary for now)
const files = {};

// random code generator
function generateCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
}

// storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });


// UPLOAD ENDPOINT
app.post("/upload", upload.single("file"), (req, res) => {

    const code = generateCode();
    const filePath = req.file.filename;

    files[code] = {
        filename: req.file.originalname,
        path: filePath,
        size: req.file.size
    };

    res.json({
        success: true,
        code: code,
        link: `https://refnull.net/${code}`
    });

});


// GET FILE INFO
app.get("/info/:code", (req, res) => {

    const file = files[req.params.code];

    if (!file) {
        return res.status(404).json({ error: "File not found" });
    }

    res.json({
        filename: file.filename,
        size: file.size
    });

});


// DOWNLOAD
app.get("/download/:code", (req, res) => {

    const file = files[req.params.code];

    if (!file) {
        return res.status(404).send("Invalid code");
    }

    const fullPath = path.join(UPLOAD_DIR, file.path);
    res.download(fullPath, file.filename);

});


app.listen(PORT, () => {
    console.log("Server running on port", PORT);
});
