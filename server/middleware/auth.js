const jwt = require('jsonwebtoken')
const { models } = require('../models')

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

const attachUserFromToken = async (req, res, next) => {
    try {
        let token = null
        if (req.cookies && req.cookies.token) token = req.cookies.token
        if (!token && req.headers && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ')
            if (parts[0] === 'Bearer' && parts[1]) token = parts[1]
        }
        if (!token) return next()

        const payload = jwt.verify(token, JWT_SECRET)
        const dbUser = await models.User.findById(payload.id).lean()
        if (!dbUser) return next()

        // Validate token against database
        if (dbUser.token !== token) {
            // Token mismatch (e.g. logged out or logged in elsewhere)
            return next()
        }

        req.user = { id: payload.id, email: payload.email, name: payload.name, role: payload.role }
        return next()
    } catch (err) {
        return next()
    }
}

const isAuthenticated = (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' })
    next()
}

module.exports = { attachUserFromToken, isAuthenticated }
