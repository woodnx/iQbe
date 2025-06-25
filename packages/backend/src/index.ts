import cors from "cors";
import express from "express";
import * as OpenApiValidator from "express-openapi-validator";
import boolParser from "express-query-boolean";
import intParser from "express-query-int";
import fs from "fs";
import path from "path";

import { errorHandler } from "@/middleware/error";
import verifyAuthToken from "@/middleware/verifyAuthToken";

import server from "./allowed-server.json";

if (!fs.existsSync(path.join(__dirname, "public", "images"))) {
  fs.mkdirSync(path.join(__dirname, "public", "images"), { recursive: true });
}

const app = express(); // expressをインスタンス化
const port = 9000;

// middleware
app.use(
  cors({
    origin: server,
    credentials: true, //レスポンスヘッダーにAccess-Control-Allow-Credentials追加
    optionsSuccessStatus: 200, //レスポンスstatusを200に設定
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use(boolParser());
app.use(intParser());
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(__dirname, "web")));

app.use(
  OpenApiValidator.middleware({
    apiSpec: path.join(__dirname, "../../api/openapi.yaml"),
    validateRequests: true, // (default)
    validateResponses: false, // false by default
  }),
);

// router import
const filenames = fs
  .readdirSync(path.join(__dirname, "routes"))
  .filter((n) => !n.includes(".map"));
const nonVerifyRoutes = ["auth"];

filenames.forEach((filename) => {
  const name = filename.replace(".js", "");
  const route_path = `${__dirname}/routes/${name}.js`;
  const route = require(route_path);

  if (nonVerifyRoutes.includes(name)) app.use(`/api/${name}`, route);
  else app.use(`/api/${name}`, verifyAuthToken, route);
});

// index
app.get("/api/*", (req, res) => {
  res.send("Undefined api root");
});

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "web", "index.html"));
});

app.use(errorHandler);

app.listen(port);

console.log(`Opened http://localhost:${port}/`);
