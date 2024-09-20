import * as dotenv from 'dotenv';
import * as express from 'express';
import axios from 'axios';
import * as path from 'path';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (_, res) => {
  const authUrl =
    `https://${process.env.AUTH0_DOMAIN}/authorize?` +
    `client_id=${encodeURIComponent(process.env.AUTH0_CLIENT_ID || '')}&` +
    `redirect_uri=${encodeURIComponent('http://localhost:3000/callback')}&` +
    `response_type=code&` +
    `response_mode=query&` +
    `scope=openid profile email`;
  res.redirect(authUrl);
});

app.get('/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID || '',
        client_secret: process.env.AUTH0_CLIENT_SECRET || '',
        code: code as string,
        redirect_uri: 'http://localhost:3000/callback',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    const { access_token } = response.data;
    res.redirect(`/?token=${access_token}`);
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/userinfo', async (req, res) => {
  const token = req.headers['authorization'];
  try {
    const response = await axios({
      method: 'get',
      url: `https://${process.env.AUTH0_DOMAIN}/userinfo`,
      headers: {
        'content-type': 'application/json',
        Authorization: token,
      },
    });
    res.json({ success: true, user: response.data });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, error: 'Failed to fetch user info' });
  }
});

function handleLogout(req: express.Request, res: express.Response) {
  req.session.destroy(() => {
    res.redirect('/');
  });
}

app.get('/logout', handleLogout);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});