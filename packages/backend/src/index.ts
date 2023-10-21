import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import admin from 'firebase-admin';
import passport from 'passport';
import passportLocal from 'passport-local';
import session from 'express-session';
import verifyAuthToken from './middleware/verifyAuthToken';
import server from './allowed-server';
import serviceAccount from './service-account.json';

const app = express(); // expressをインスタンス化
const LocalStrategy = passportLocal.Strategy;
const port = 9000;

// test users
const users: {
  username?: string,
  password?: string,
  age?: number,
}[] = [
  { username: 'alice', password: 'alice', age: 22 },
  { username: 'bob', password: 'bob', age: 21 },
  { username: 'carol', password: 'carol', age: 30 }
]

// test Users class
const User = {
  findOne({ username }: { username: string }) {
    return users.find(user => user.username === username) || null
  }
}

const params = {
  type: serviceAccount.type,
  projectId: serviceAccount.project_id,
  privateKeyId: serviceAccount.private_key_id,
  privateKey: serviceAccount.private_key,
  clientEmail: serviceAccount.client_email,
  clientId: serviceAccount.client_id,
  authUri: serviceAccount.auth_uri,
  tokenUri: serviceAccount.token_uri,
  authProviderX509CertUrl: serviceAccount.auth_provider_x509_cert_url,
  clientC509CertUrl: serviceAccount.client_x509_cert_url
};

admin.initializeApp({
  credential: admin.credential.cert(params),
  projectId: 'web-quiz-collections'
});

passport.use(new LocalStrategy((username, password, done) => {
  try {
    const user = User.findOne({ username });
    if (user == null) {
      return done(null, false);
    }
    if (user.password !== password) {
      return done(null, false);
    }
    delete user.password;

    return done(null, user);
  } catch(e) {
    done(e);
  }
}));

// middleware
app.use(cors({
  origin: server, 
  credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
  optionsSuccessStatus: 200 //レスポンスstatusを200に設定
}));
app.use(session({
  secret: "cats",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(path.join(__dirname, 'web'))); 

// router import
const filenames = fs.readdirSync(path.join(__dirname, 'routes'));
filenames.forEach(filename => {
  const name = filename.replace('.js', '');
  app.use(`/api/${name}`, verifyAuthToken, require(`./routes/${name}`));
});


// index
app.get('/api/*', (req, res) => {
  res.send('Undefined api root');
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

app.listen(port);

console.log(`Opened http://localhost:${port}/`);