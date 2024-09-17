const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const port = 3000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const JWT_SECRET_KEY = 'IP11_Panchenko';
const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
];
app.post('/api/login', (req, res) => {
    const { login, password } = req.body;
    const user = users.find(user => user.login === login &&
    user.password === password);
    if (user) {
        const token = jwt.sign({ username: user.username,
        login: user.login }, JWT_SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Unauthorized');
    }
});
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        if (req.path === '/' || req.path === '/api/login')
            return next();
        else return res.sendStatus(401);
    }
    jwt.verify(token, JWT_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};
app.get('/', authenticateToken, (req, res) => {
    console.log(req.user);
    if (req.user) {
        return res.json({
            username: req.user.username,
            logout: 'http://localhost:3000/logout'
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});