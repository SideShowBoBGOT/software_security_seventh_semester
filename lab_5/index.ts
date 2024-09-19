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

const expiration_period = 5 * 60 * 1000;

const refreshToken: express.RequestHandler = async (req, res, next) => {
  const tokens = req.session.tokens;

  if (!tokens) return next();

  const isTokenExpired = (expiresIn: number, bufferPeriod: number) =>
    Date.now() > expiresIn - bufferPeriod;

  const logExpirationDate = (expiresIn: number) => {
    const expirationDate = new Date(expiresIn);
    console.log(`Expiration time point: ${expirationDate.toLocaleString()}`);
  };

  const refreshAuthToken = async (refreshToken: string) => {
    try {
      const response = await axios.post<{ access_token: string; expires_in: number }>(
        `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: process.env.AUTH0_CLIENT_ID!,
          client_secret: process.env.AUTH0_CLIENT_SECRET!,
          refresh_token: refreshToken,
        }),
        { headers: { 'content-type': 'application/x-www-form-urlencoded' } }
      );

      return {
        access_token: response.data.access_token,
        expires_in: Date.now() + response.data.expires_in * 1000,
      };
    } catch (error) {
      throw new Error(
        (error as AxiosError).response?.data
          ? JSON.stringify((error as AxiosError).response?.data)
          : (error as Error).message
      );
    }
  };

  if (tokens.expires_in) {
    logExpirationDate(tokens.expires_in);
  }

  if (isTokenExpired(tokens.expires_in, expiration_period)) {
    try {
      const newTokens = await refreshAuthToken(tokens.refresh_token);
      req.session.tokens = {
        ...newTokens,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      console.error('Error refreshing token:', error.message);
      return res.status(401).json({ error: 'Failed to refresh token' });
    }
  }

  next();
};

app.use(refreshToken);

async function handleHomeRoute(req: express.Request, res: express.Response) {
  const session = req.session;

  if (session.tokens) {
    try {
      const userInfo = await getUserInfo(session.tokens.access_token);
      res.json({
        user: userInfo,
        logout: '/logout',
      });
    } catch (error) {
      await handleUserInfoError(req, res, error);
    }
  } else {
    res.sendFile(path.join(__dirname, 'index.html'));
  }
}

async function handleUserInfoError(req: express.Request, res: express.Response, error: unknown) {
  console.error('Error:', (error as AxiosError).response?.data || (error as Error).message);
  await new Promise<void>((resolve) => req.session.destroy(() => resolve()));
  res.status(500).json({ error: 'An error occurred while fetching user info' });
}

function handleLogout(req: express.Request, res: express.Response) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

async function getUserInfo(accessToken: string) {
  const response = await axios.get(
    `https://${process.env.AUTH0_DOMAIN}/userinfo`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
}

app.get('/', handleHomeRoute);
app.get('/logout', handleLogout);

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

async function getAuth0Token() {
  const response = await axios.post<{ access_token: string }>(
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
  return response.data.access_token;
}

async function registerUser(req: express.Request<{}, {}, RegisterBody>, res: express.Response) {
  const { email, password, name, nickname } = req.body;

  try {
    const authToken = await getAuth0Token();
    const user = await createAuth0User(authToken, { email, password, name, nickname });
    
    res.status(201).json({
      success: true,
      userId: user,
      login: '/',
    });
  } catch (error) {
    handleError(res, error as Error | AxiosError);
  }
}

async function createAuth0User(token: string, userData: Omit<RegisterBody, 'password'> & { password: string }) {
  const response = await axios.post(
    `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
    {
      ...userData,
      connection: 'Username-Password-Authentication',
      verify_email: true,
      picture: 'https://static.wikia.nocookie.net/sonic-x9874/images/6/6f/Sonic_135.png/revision/latest/thumbnail/width/360/height/360?cb=20160226182328',
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
    }
  );
  return response.data;
}

function handleError(res: express.Response, error: Error | AxiosError) {
  console.error('Registration failed:', (error as AxiosError).response?.data || error.message);
  res.status(400).json({
    success: false,
    error: (error as AxiosError).response?.data || error.message,
  });
}

app.post('/api/register', registerUser);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});