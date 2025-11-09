import websocket
import json

ws = websocket.WebSocket()
ws.connect("ws://192.168.0.83:3000")

msg = {
    "type": "pixel",
    "x": 1000,
    "y": 1000,
    "color": "#f4f4f4",
    "timestamp": 1762640288781
}

ws.send(json.dumps(msg))
print("Message sent!")
ws.close()
