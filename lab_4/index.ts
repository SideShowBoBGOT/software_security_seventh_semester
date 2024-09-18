import * as dotenv from 'dotenv';
import * as express from 'express';
import axios, { AxiosError } from 'axios';
import * as path from 'path';
import * as session from 'express-session';

dotenv.config();

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

declare module 'express-session' {
  interface SessionData {
    tokens?: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  }
}

interface LoginBody {
  login: string;
  password: string;
}

interface RegisterBody {
  email: string;
  password: string;
  name: string;
  nickname: string;
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

const refreshToken: express.RequestHandler = async (req, res, next) => {
  const tokens = req.session.tokens;
  if (tokens?.expires_in) {
    const expirationDate = new Date(tokens.expires_in);
    console.log(`Token expires on: ${expirationDate.toLocaleString()}`);
  }
  if (tokens && Date.now() > tokens.expires_in - 5 * 60 * 1000) {
    try {
      const response = await axios.post<{ access_token: string; expires_in: number }>(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.AUTH0_CLIENT_ID!,
          client_secret: process.env.AUTH0_CLIENT_SECRET!,
          refresh_token: tokens.refresh_token,
        }),
        {
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
        }
      );

      req.session.tokens = {
        access_token: response.data.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: Date.now() + response.data.expires_in * 1000,
      };
    } catch (error) {
      console.error('Error refreshing token:', (error as AxiosError).response?.data || (error as Error).message);
      return res.status(401).json({ error: 'Failed to refresh token' });
    }
  }
  next();
};

app.use(refreshToken);

app.get('/', async (req, res) => {
  if (req.session.tokens) {
    try {
      const { access_token } = req.session.tokens;
      const response = await axios.get(
        `https://${process.env.AUTH0_DOMAIN}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );

      res.json({
        user: response.data,
        logout: '/logout',
      });
    } catch (error) {
      console.error('Error:', (error as AxiosError).response?.data || (error as Error).message);
      req.session.destroy(() => {});
      res.status(500).json({ error: 'An error occurred while fetching user info' });
    }
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

app.post('/api/login', async (req: express.Request<{}, {}, LoginBody>, res) => {
  try {
    const { login, password } = req.body;
    const response = await axios.post<{ access_token: string; refresh_token: string; expires_in: number }>(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      new URLSearchParams({
        grant_type: 'password',
        username: login,
        password: password,
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        scope: 'offline_access openid profile email',
      }),
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }
    );

    req.session.tokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: Date.now() + response.data.expires_in * 1000,
    };
    res.json({ success: true, token: response.data.access_token });
  } catch (error) {
    console.error('Login failed:', (error as AxiosError).response?.data || (error as Error).message);
    res.status(401).send('Login failed');
  }
});

app.post('/api/register', async (req: express.Request<{}, {}, RegisterBody>, res) => {
  const { email, password, name, nickname } = req.body;

  try {
    const authData = await axios.post<{ access_token: string }>(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.AUTH0_CLIENT_ID!,
        client_secret: process.env.AUTH0_CLIENT_SECRET!,
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
      }),
      {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
      }
    );

    const userResponse = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
      {
        email: email,
        password: password,
        connection: 'Username-Password-Authentication',
        verify_email: true,
        name: name,
        nickname: nickname,
        picture:
          'https://i.pinimg.com/originals/e1/4c/ae/e14cae2f0f44121ab4e3506002ba1a55.jpg',
      },
      {
        headers: {
          Authorization: `Bearer ${authData.data.access_token}`,
          'content-type': 'application/json',
        },
      }
    );
    res.status(201).json({
      success: true,
      userId: userResponse.data,
      login: '/',
    });
  } catch (error) {
    console.error('Registration failed:', (error as AxiosError).response?.data || (error as Error).message);
    res.status(400).json({
      success: false,
      error: (error as AxiosError).response?.data,
    });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});