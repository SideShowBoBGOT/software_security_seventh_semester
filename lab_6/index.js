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
dotenv.config();
var app = express();
var port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/', function (_, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/login', function (_, res) {
    var authUrl = "https://".concat(process.env.AUTH0_DOMAIN, "/authorize?") +
        "client_id=".concat(encodeURIComponent(process.env.AUTH0_CLIENT_ID || ''), "&") +
        "redirect_uri=".concat(encodeURIComponent('http://localhost:3000/callback'), "&") +
        "response_type=code&" +
        "response_mode=query&" +
        "scope=openid profile email";
    res.redirect(authUrl);
});
app.get('/callback', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var code, response, access_token, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                code = req.query.code;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.post("https://".concat(process.env.AUTH0_DOMAIN, "/oauth/token"), new URLSearchParams({
                        grant_type: 'authorization_code',
                        client_id: process.env.AUTH0_CLIENT_ID || '',
                        client_secret: process.env.AUTH0_CLIENT_SECRET || '',
                        code: code,
                        redirect_uri: 'http://localhost:3000/callback',
                    }), {
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    })];
            case 2:
                response = _a.sent();
                access_token = response.data.access_token;
                res.redirect("/?token=".concat(access_token));
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Error exchanging code for tokens:', error_1);
                res.status(500).send('Internal Server Error');
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/userinfo', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var token, response, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                token = req.headers['authorization'];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, axios_1.default)({
                        method: 'get',
                        url: "https://".concat(process.env.AUTH0_DOMAIN, "/userinfo"),
                        headers: {
                            'content-type': 'application/json',
                            Authorization: token,
                        },
                    })];
            case 2:
                response = _a.sent();
                res.json({ success: true, user: response.data });
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                console.log(e_1);
                res.status(500).json({ success: false, error: 'Failed to fetch user info' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
function handleLogout(req, res) {
    req.session.destroy(function () {
        res.redirect('/');
    });
}
app.get('/logout', handleLogout);
app.listen(port, function () {
    console.log("Example app listening on port ".concat(port));
});
