const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    }

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
        if (err) {
            return res.status(501).send({ auth: false, message: 'Failed to authenticate token.' });
        }

        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};

module.exports = authMiddleware;
