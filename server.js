const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");
const WebSocket = require("ws");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Basic Web Authentication
app.use((req, res, next) => {
  const auth = { login: "admin", password: "secret" };
  const b64auth = (req.headers.authorization || "").split(" ")[1] || "";
  const [login, password] = Buffer.from(b64auth, "base64").toString().split(":");

  if (login === auth.login && password === auth.password) {
    return next();
  }

  res.set("WWW-Authenticate", 'Basic realm="Protected GPIO"');
  res.status(401).send("Authentication required.");
});

// WebSocket Server
const wss = new WebSocket.Server({ port: 3001 });

function broadcastStatus() {
  const readCommand = `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null pi@host.docker.internal -p 5023 'cat gpio-status.json'`;
  exec(readCommand, (err, stdout, stderr) => {
    if (err) {
      console.error("SSH Read Error:", stderr || err.message);
      return;
    }
    try {
      if (!stdout.trim()) throw new Error("GPIO status is empty");
      const data = JSON.parse(stdout);
      const json = JSON.stringify({ type: "status", data });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(json);
        }
      });
    } catch (e) {
      console.error("Error parsing GPIO status:", e.message);
    }
  });
}

// POST /gpio — supports batch or single commands
app.post("/gpio", async (req, res) => {
  const commands = Array.isArray(req.body.commands)
    ? req.body.commands
    : [req.body.command];

  const results = [];

  for (const cmd of commands) {
    const ssh = `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null pi@host.docker.internal -p 5023 'python3 fake_gpio.py ${cmd}'`;
    try {
      const output = await new Promise(resolve =>
        exec(ssh, (err, stdout, stderr) => {
          if (err) return resolve(`Error: ${stderr || err.message}`);
          resolve(stdout.trim());
        })
      );
      results.push(output);
    } catch (e) {
      results.push(`Failed to run command: ${cmd}`);
    }
  }

  broadcastStatus();
  res.json({ message: results.join("\n") });
});

// GET /gpio-status
app.get("/gpio-status", (req, res) => {
  const cmd = `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null pi@host.docker.internal -p 5023 'cat gpio-status.json'`;
  exec(cmd, (err, stdout, stderr) => {
    if (err) return res.status(500).json({ error: stderr || err.message });
    try {
      if (!stdout.trim()) throw new Error("GPIO status is empty");
      const data = JSON.parse(stdout);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to parse GPIO status" });
    }
  });
});

// Simulated Sensor Logic (15s interval)
setInterval(() => {
  const rand = Math.round(Math.random());
  const cmd = `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null pi@host.docker.internal -p 5023 'python3 fake_gpio.py write 22 ${rand}'`;
  exec(cmd, (err, stdout, stderr) => {
    if (!err) {
      broadcastStatus();
    } else {
      console.error("Sensor SSH error:", stderr || err.message);
    }
  });
}, 15000);

// Start Server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

