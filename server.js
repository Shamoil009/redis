// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// const Redis = require("redis");

import express from "express";
import axios from "axios";
import cors from "cors";
import Redis from "redis";

const app = express();
app.use(cors());

const redisClient = Redis.createClient({
  username: "default",
  password: "Fk6ezJdFce9mEvo22cBYK3qxqo9bcEZd",
  socket: {
    host: "redis-13803.c16.us-east-1-2.ec2.redns.redis-cloud.com",
    port: 13803,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

await redisClient.connect();

const DEFAULT_EXPIRATION = 3600;

app.get("/photos", async (req, res) => {
  const albumId = req.query.albumId;

  const photos = await getOrSetCache(`photos?albumId=${albumId}`, async () => {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/photos",
      { params: { albumId } }
    );
    return data;
  });
  res.json(photos);
});

app.get("/photos/:id", async (req, res) => {
  const { data } = await axios.get(
    `https://jsonplaceholder.typicode.com/photos/${req.params.id}`
  );
  res.json(data);
});

function getorSetCache(key, cb) {
  return new Promise((resolve, reject) => {
    redisClient.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.parse(data));
      const freshData = await cb();
      redisClient.setex(key, DEFAULT_EXPIRATION, JSON.stringify(freshData));
    });
  });
}

app.listen(4000);

// await client.connect();

// await client.set("foo", "bar");
// const result = await client.get("foo");
// console.log(result); // >>> bar
