const express = require('express')
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

router.get('/users', auth, role, async (req, res) => {
    try {
        const user = await User.find({})
        res.send(user)

    } catch (e) {
        res.sendStatus(500)
    }
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

router.delete('/user/:id', auth, role, async (req, res) => {
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




module.exports = router