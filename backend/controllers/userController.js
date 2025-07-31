const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 8);
        const existingUser = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
        if (existingUser.length > 0) {
            return res.status(400).send({ message: "Email already in use" });
        }
        db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role || 'user'], (err, results) => {
            if (err) {
                return res.status(500).send(err);
            }
            const token = jwt.sign({ id: results.insertId, name, email, role: role || 'user' }, 'your_jwt_secret', {
                expiresIn: 86400 // 24 hours
            });
            res.status(201).send({ auth: true, token, message: "Signed Up Successfully" });
        });
    } catch (error) {
        res.status(500).send({ message: "Error creating user" });
    }
};

exports.signin = async (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.status(500).send('Error on the server.');
        }
        if (results.length === 0) {
            return res.status(404).send('No user found.');
        }
        const user = results[0];
        const passwordIsValid = await bcrypt.compare(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send({ auth: false, token: null });
        }
        const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, 'your_jwt_secret', {
            expiresIn: 86400 // 24 hours
        });
        res.status(200).send({ auth: true, token });
    });
};