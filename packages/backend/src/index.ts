import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import verifyAuthToken from './middleware/verifyAuthToken';
import server from './allowed-server';

const app = express(); // expressをインスタンス化
const port = 9000;

// middleware
app.use(cors({
  origin: server, 
  credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
  optionsSuccessStatus: 200 //レスポンスstatusを200に設定
}));
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public'))); 
app.use(express.static(path.join(__dirname, 'web'))); 

// router import
const filenames = fs.readdirSync(path.join(__dirname, 'routes'));
const nonVerifyRoutes = [
  'auth',
];

filenames.forEach(filename => {
  const name = filename.replace('.js', '');
  if (nonVerifyRoutes.includes(name)) app.use(`/api/${name}`, require(`./routes/${name}`));
  else app.use(`/api/${name}`, verifyAuthToken, require(`./routes/${name}`));
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