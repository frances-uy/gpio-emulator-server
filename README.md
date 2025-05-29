# GPIO Emulator Server

This project emulates GPIO pin control through a Node.js server, with a Python-based backend simulating a Raspberry Pi environment via QEMU.

## Features

- Web interface to control GPIO pins
- Real-time GPIO status updates using WebSockets
- SSH-based command execution on a virtual Raspberry Pi
- Python `fake_gpio.py` script to emulate pin state
- Simulated sensor values that update every 15 seconds

## Components

- `server.js`: Node.js backend server (REST API + WebSocket)
- `index.html`: Frontend interface
- `fake_gpio.py`: GPIO emulator script running in QEMU VM
- `gpio-status.json`: Persistent GPIO state file

## Tech Stack

- Node.js / Express
- Python 3
- WebSockets
- QEMU (for virtual Raspberry Pi)
- Docker (for encapsulated development)
- GitHub for version control

## Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/frances-uy/gpio-emulator-server.git
cd gpio-emulator-server
```

### 2. Install Node Dependencies
```bash
npm install
```

### 3. Start the QEMU VM
Make sure QEMU is installed, then:
```bash
./run-qemu.sh
```

Wait for the Raspberry Pi VM to boot fully.

### 4. Start the Server
```bash
node server.js
```

Or through Docker (preferred)
```bash
docker compose up --build
```

### 5. Open the Web Interface
```bash
http://localhost:3000
```

### 6. Use API Call to Test (Optional)
```bash
curl -X POST http://localhost:3000/gpio \
  -H "Content-Type: application/json" \
  -u admin:secret \
  -d '{"command":"write 17 1"}'
```


## Folder Structure
```bash
gpio-emulator-server/
│
├── server.js           # Node server
├── index.html          # Frontend UI
├── fake_gpio.py        # GPIO emulator
├── gpio-status.json    # State file
├── run-qemu.sh         # QEMU boot script
├── Dockerfile / docker-compose.yml
├── .gitignore
└── README.md
```

