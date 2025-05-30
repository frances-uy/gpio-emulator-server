import sys
import json
import os

STATE_FILE = "gpio-status.json"
gpio_state = {}

def load_state():
    global gpio_state
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r") as f:
            gpio_state = json.load(f)
    else:
        gpio_state = {}

def save_state():
    with open(STATE_FILE, "w") as f:
        json.dump(gpio_state, f, indent=2)

def write(pin, value):
    pin = str(pin)
    gpio_state[pin] = gpio_state.get(pin, {})
    mode = gpio_state[pin].get("mode", "output")
    if mode != "output":
        print(f"Warning: Cannot write to GPIO {pin}, it is in {mode} mode")
        return
    gpio_state[pin]["value"] = int(value)
    gpio_state[pin].setdefault("mode", "output")
    save_state()
    print(f"GPIO {pin} set to {value}")

def pinMode(pin, mode):
    pin = str(pin)
    gpio_state[pin] = gpio_state.get(pin, {})
    gpio_state[pin]["mode"] = mode
    gpio_state[pin].setdefault("value", 0)
    save_state()
    print(f"GPIO {pin} mode set to {mode}")

def read():
    load_state()
    print(json.dumps(gpio_state))

def reset():
    global gpio_state
    gpio_state = {}
    save_state()
    print("GPIO state reset")

if __name__ == "__main__":
    load_state()
    args = sys.argv

    if len(args) == 4 and args[1] == "write":
        write(args[2], args[3])
    elif len(args) == 3 and args[1] == "pinMode":
        pinMode(args[2], args[3])
    elif len(args) == 2 and args[1] == "read":
        read()
    elif len(args) == 2 and args[1] == "reset":
        reset()
    else:
        print("Usage:")
        print("  write <pin> <value>")
        print("  pinMode <pin> <mode>")
        print("  read")
        print("  reset")
