"use strict";

require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const axios = require("axios");

// Application servers
const servers = [
  `${process.env.HOST}:${process.env.PORT1}`,
  `${process.env.HOST}:${process.env.PORT2}`,
];

// Track the current application server to send request
let current = 0;

// Receive new request
// Forward to application server
const handler = async (req: any, res: any) => {
  // Destructure following properties from request object
  const { method, url, headers, body } = req;

  // Select the current server to forward the request
  const server = servers[current];

  // Update track to select next server
  current === servers.length - 1 ? (current = 0) : current++;

  try {
    // Requesting to underlying application server
    const response = await axios({
      url: `${server}${url}`,
      method: method,
      headers: headers,
      data: body,
    });
    // Send back the response data
    // from application server to client
    res.send(response.data);
  } catch (err) {
    // Send back the error message
    res.status(500).send("Server error!");
  }
};

// When receive new request
// Pass it to handler method
app.use((req: any, res: any) => {
  handler(req, res);
});

// Listen on PORT 8080

try {
  app.listen(process.env.LOAD_BALANCER_PORT, (): void => {
    console.log(
      `Load Balancer Server Listening On Port ${process.env.LOAD_BALANCER_PORT}`
    );
  });
} catch (error: any) {
  console.error(`Error occured: ${error.message}`);
}
