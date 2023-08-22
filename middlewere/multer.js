const multer = require("multer")
const path = require("path");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productimages'));
    },
    filename: function (req, file, cb) {
        console.log(file);
        const name = Date.now() + '-' + file.originalname;
        cb(null, name)
    }
});

const maxSize = 82428800
const upload = multer({
    storage: storage, limits: { fileSize: maxSize }, fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/jpeg" || file.mimetype == "image/jpg" || file.mimetype == "image/png") {
            cb(null, true)
        } else {
            cb(null, false);
            return cb(new Error("only .png, . jpg and .jpeg format allowd!"));
        }
    }
})

module.exports = upload;