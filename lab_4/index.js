"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getUserInfo = getUserInfo;
exports.handleError = handleError;
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
var expiration_period = 5 * 60 * 1000;
var refreshToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var tokens, isTokenExpired, logExpirationDate, refreshAuthToken, newTokens, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tokens = req.session.tokens;
                if (!tokens)
                    return [2 /*return*/, next()];
                isTokenExpired = function (expiresIn, bufferPeriod) {
                    return Date.now() > expiresIn - bufferPeriod;
                };
                logExpirationDate = function (expiresIn) {
                    var expirationDate = new Date(expiresIn);
                    console.log("Token expires on: ".concat(expirationDate.toLocaleString()));
                };
                refreshAuthToken = function (refreshToken) { return __awaiter(void 0, void 0, void 0, function () {
                    var response, error_2;
                    var _a, _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                _c.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/oauth/token"), new URLSearchParams({
                                        grant_type: 'refresh_token',
                                        client_id: process.env.AUTH0_CLIENT_ID,
                                        client_secret: process.env.AUTH0_CLIENT_SECRET,
                                        refresh_token: refreshToken,
                                    }), { headers: { 'content-type': 'application/x-www-form-urlencoded' } })];
                            case 1:
                                response = _c.sent();
                                return [2 /*return*/, {
                                        access_token: response.data.access_token,
                                        expires_in: Date.now() + response.data.expires_in * 1000,
                                    }];
                            case 2:
                                error_2 = _c.sent();
                                throw new Error(((_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data)
                                    ? JSON.stringify((_b = error_2.response) === null || _b === void 0 ? void 0 : _b.data)
                                    : error_2.message);
                            case 3: return [2 /*return*/];
                        }
                    });
                }); };
                if (tokens.expires_in) {
                    logExpirationDate(tokens.expires_in);
                }
                if (!isTokenExpired(tokens.expires_in, expiration_period)) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, refreshAuthToken(tokens.refresh_token)];
            case 2:
                newTokens = _a.sent();
                req.session.tokens = __assign(__assign({}, newTokens), { refresh_token: tokens.refresh_token });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error refreshing token:', error_1.message);
                return [2 /*return*/, res.status(401).json({ error: 'Failed to refresh token' })];
            case 4:
                next();
                return [2 /*return*/];
        }
    });
}); };
app.use(refreshToken);
function handleHomeRoute(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var session, userInfo, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    session = req.session;
                    if (!session.tokens) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 5]);
                    return [4 /*yield*/, getUserInfo(session.tokens.access_token)];
                case 2:
                    userInfo = _a.sent();
                    res.json({
                        user: userInfo,
                        logout: '/logout',
                    });
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    return [4 /*yield*/, handleUserInfoError(req, res, error_3)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [3 /*break*/, 7];
                case 6:
                    res.sendFile(path.join(__dirname, 'index.html'));
                    _a.label = 7;
                case 7: return [2 /*return*/];
            }
        });
    });
}
function handleUserInfoError(req, res, error) {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.error('Error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
                    return [4 /*yield*/, new Promise(function (resolve) { return req.session.destroy(function () { return resolve(); }); })];
                case 1:
                    _b.sent();
                    res.status(500).json({ error: 'An error occurred while fetching user info' });
                    return [2 /*return*/];
            }
        });
    });
}
function handleLogout(req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
}
function getUserInfo(accessToken) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get("https://".concat(process.env.AUTH0_DOMAIN, "/userinfo"), {
                        headers: {
                            Authorization: "Bearer ".concat(accessToken),
                        },
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
app.get('/', handleHomeRoute);
app.get('/logout', handleLogout);
app.post('/api/login', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, login, password, response, error_4;
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
                error_4 = _c.sent();
                console.error('Login failed:', ((_b = error_4.response) === null || _b === void 0 ? void 0 : _b.data) || error_4.message);
                res.status(401).send('Login failed');
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
function getAuth0Token() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/oauth/token"), new URLSearchParams({
                        grant_type: 'client_credentials',
                        client_id: process.env.AUTH0_CLIENT_ID,
                        client_secret: process.env.AUTH0_CLIENT_SECRET,
                        audience: "https://".concat(process.env.AUTH0_DOMAIN, "/api/v2/"),
                    }), {
                        headers: { 'content-type': 'application/x-www-form-urlencoded' },
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data.access_token];
            }
        });
    });
}
function registerUser(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, email, password, name, nickname, authToken, user, error_5;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, email = _a.email, password = _a.password, name = _a.name, nickname = _a.nickname;
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, getAuth0Token()];
                case 2:
                    authToken = _b.sent();
                    return [4 /*yield*/, createAuth0User(authToken, { email: email, password: password, name: name, nickname: nickname })];
                case 3:
                    user = _b.sent();
                    res.status(201).json({
                        success: true,
                        userId: user,
                        login: '/',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_5 = _b.sent();
                    handleError(res, error_5);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function createAuth0User(token, userData) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/api/v2/users"), __assign(__assign({}, userData), { connection: 'Username-Password-Authentication', verify_email: true, picture: 'https://i.pinimg.com/originals/e1/4c/ae/e14cae2f0f44121ab4e3506002ba1a55.jpg' }), {
                        headers: {
                            Authorization: "Bearer ".concat(token),
                            'content-type': 'application/json',
                        },
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
function handleError(res, error) {
    var _a, _b;
    console.error('Registration failed:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
    res.status(400).json({
        success: false,
        error: ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message,
    });
}
app.post('/api/register', registerUser);
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
