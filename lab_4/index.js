"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = require("dotenv");
var express = require("express");
var axios_1 = require("axios");
var path = require("path");
var session = require("express-session");
dotenv.config();
var app = express();
var port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
}));
var refreshToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var tokens, expirationDate, response, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                tokens = req.session.tokens;
                if (tokens === null || tokens === void 0 ? void 0 : tokens.expires_in) {
                    expirationDate = new Date(tokens.expires_in);
                    console.log("Token expires on: ".concat(expirationDate.toLocaleString()));
                }
                if (!(tokens && Date.now() > tokens.expires_in - 5 * 60 * 1000)) return [3 /*break*/, 4];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/oauth/token"), new URLSearchParams({
                        grant_type: 'refresh_token',
                        client_id: process.env.AUTH0_CLIENT_ID,
                        client_secret: process.env.AUTH0_CLIENT_SECRET,
                        refresh_token: tokens.refresh_token,
                    }), {
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    })];
            case 2:
                response = _b.sent();
                req.session.tokens = {
                    access_token: response.data.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_in: Date.now() + response.data.expires_in * 1000,
                };
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error('Error refreshing token:', ((_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data) || error_1.message);
                return [2 /*return*/, res.status(401).json({ error: 'Failed to refresh token' })];
            case 4:
                next();
                return [2 /*return*/];
        }
    });
}); };
app.use(refreshToken);
app.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var access_token, response, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!req.session.tokens) return [3 /*break*/, 5];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                access_token = req.session.tokens.access_token;
                return [4 /*yield*/, axios_1.default.get("https://".concat(process.env.AUTH0_DOMAIN, "/userinfo"), {
                        headers: {
                            Authorization: "Bearer ".concat(access_token),
                        },
                    })];
            case 2:
                response = _b.sent();
                res.json({
                    user: response.data,
                    logout: '/logout',
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _b.sent();
                console.error('Error:', ((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data) || error_2.message);
                req.session.destroy(function () { });
                res.status(500).json({ error: 'An error occurred while fetching user info' });
                return [3 /*break*/, 4];
            case 4: return [3 /*break*/, 6];
            case 5:
                res.sendFile(path.join(__dirname, 'index.html'));
                _b.label = 6;
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/logout', function (req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
});
app.post('/api/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, login, password, response, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                _a = req.body, login = _a.login, password = _a.password;
                return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/oauth/token"), new URLSearchParams({
                        grant_type: 'password',
                        username: login,
                        password: password,
                        client_id: process.env.AUTH0_CLIENT_ID,
                        client_secret: process.env.AUTH0_CLIENT_SECRET,
                        audience: "https://".concat(process.env.AUTH0_DOMAIN, "/api/v2/"),
                        scope: 'offline_access openid profile email',
                    }), {
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    })];
            case 1:
                response = _c.sent();
                req.session.tokens = {
                    access_token: response.data.access_token,
                    refresh_token: response.data.refresh_token,
                    expires_in: Date.now() + response.data.expires_in * 1000,
                };
                res.json({ success: true, token: response.data.access_token });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _c.sent();
                console.error('Login failed:', ((_b = error_3.response) === null || _b === void 0 ? void 0 : _b.data) || error_3.message);
                res.status(401).send('Login failed');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.post('/api/register', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, name, nickname, authData, userResponse, error_4;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password, name = _a.name, nickname = _a.nickname;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 4, , 5]);
                return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/oauth/token"), new URLSearchParams({
                        grant_type: 'client_credentials',
                        client_id: process.env.AUTH0_CLIENT_ID,
                        client_secret: process.env.AUTH0_CLIENT_SECRET,
                        audience: "https://".concat(process.env.AUTH0_DOMAIN, "/api/v2/"),
                    }), {
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    })];
            case 2:
                authData = _d.sent();
                return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/api/v2/users"), {
                        email: email,
                        password: password,
                        connection: 'Username-Password-Authentication',
                        verify_email: true,
                        name: name,
                        nickname: nickname,
                        picture: 'https://i.pinimg.com/originals/e1/4c/ae/e14cae2f0f44121ab4e3506002ba1a55.jpg',
                    }, {
                        headers: {
                            Authorization: "Bearer ".concat(authData.data.access_token),
                            'content-type': 'application/json',
                        },
                    })];
            case 3:
                userResponse = _d.sent();
                res.status(201).json({
                    success: true,
                    userId: userResponse.data,
                    login: '/',
                });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _d.sent();
                console.error('Registration failed:', ((_b = error_4.response) === null || _b === void 0 ? void 0 : _b.data) || error_4.message);
                res.status(400).json({
                    success: false,
                    error: (_c = error_4.response) === null || _c === void 0 ? void 0 : _c.data,
                });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
