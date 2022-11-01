const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const err = new Error('Invalid authorization header');
        err.statusCode = 401;
        throw err;
    }
    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'secret');
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }
    if (!decodedToken) {
        const err = new Error('Invalid');
        err.statusCode = 401;
        throw err;
    }
    req.userId = decodedToken.userId;
    next();
    
};