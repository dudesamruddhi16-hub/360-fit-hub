const jwt = require('jsonwebtoken')
const { models } = require('../models')

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) return res.status(400).json({ error: 'email and password required' })

        const user = await models.User.findOne({ email })
        if (!user) return res.status(401).json({ error: 'Invalid credentials' })

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const token = jwt.sign(
            { id: user._id.toString(), role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        )

        const cookieOptions = {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        }
        res.cookie('token', token, cookieOptions)

        const userObj = user.toObject()
        delete userObj.password
        return res.json({ user: userObj })
    } catch (err) {
        console.error('Auth login error:', err)
        return res.status(500).json({ error: 'Login failed' })
    }
}

const logout = async (req, res) => {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
    return res.json({ success: true })
}

const getMe = async (req, res) => {
    try {
        const user = await models.User.findById(req.user.id).select('-password')
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json({ user })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}

module.exports = { login, logout, getMe }
