const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
})

// process.env.MONGODB_URL = mongodb://127.0.0.1:27017/courserep-data