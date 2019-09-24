const app = require('./app')

const port= process.env.PORT

// coming soon...
// const multer = require('multer')

// const upload = multer({
//     dest: 'images'
// })

// app.post('/upload', upload.single('upload'), (req, res) => {
//     res.send()
// })

app.listen(port, () => {
    console.log(`Sever running on port ${port}`)
})

