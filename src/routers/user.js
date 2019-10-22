const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const { auth, role } = require('../middleware/auth')
const router = express.Router()

router.post('/users', async(req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch(e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.username, req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch(e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.sendStatus(500)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    } catch (e) {
        res.sendStatus(500)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//  
router.get('/users',auth, role, async (req, res) => {
    try {
        const user = await User.find({})
        res.send(user)

    } catch (e) {
        res.sendStatus(500)
    }
})

// Testing
router.get('/testing', (req, res) => {
    res.send({
        name: 'udochukwu',
        about: 'Hello world. I dont have anything to tell you'
    })
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['fullname', 'username', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation) {
        return res.status(400).send({ error: 'invalid update!' })
    }
    
    try {
        const user = await req.user

        updates.forEach((update) => user[update] = req.body[update])

        await user.save()
        
        if (!user) {
            return res.sendStatus(404)
        }
    
        res.status(200).send(user)

    } catch(e) {
        res.sendStatus(400)
    }
})

router.delete('/users/:id', auth, role, async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id)

        if(!user) {
            return res.sendStatus(404)
        }

        res.status(200).send(user)
    } catch(e) {
        res.sendStatus(500)
    }
})

// Avatar
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.sendStatus(404)
    }
})




module.exports = router