import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import admin from 'firebase-admin';
import verifyAuthToken from './middleware/verifyAuthToken';
import server from './allowed-server';
import serviceAccount from './service-account.json';

const app = express(); // expressをインスタンス化
const port = 9000;

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

app.use(cors({
  origin: server, 
  credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
  optionsSuccessStatus: 200 //レスポンスstatusを200に設定
}));
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(path.join(__dirname, 'web'))); 

const filenames = fs.readdirSync(path.join(__dirname, 'routes'));
filenames.forEach(filename => {
  const name = filename.replace('.js', '');
  app.use(`/api/${name}`, verifyAuthToken, require(`./routes/${name}`));
});

app.get('/api/*', (req, res) => {
  res.send('Undefined api root');
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'index.html'));
});

app.listen(port);

console.log(`Opened http://localhost:${port}/`);