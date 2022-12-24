const multer = require("multer");

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null, './images')
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now(+file.originalname))
    }
})

const filter = (req,file,cb)=>{
    if(file.mimetype == 'image/png' || file.mimetype == 'image/jpg'){
        cb(null, true)
    }
}
const upload = multer({
    storage:storage,
    fileFilter:filter
})

module.exports = upload;