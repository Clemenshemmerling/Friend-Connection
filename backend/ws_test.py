# Save this as ws_test.py and run it to test WebSocket connection to your server
import websocket

try:
    ws = websocket.create_connection("ws://localhost:8000/ws")
    print("WebSocket is open")
    ws.close()
except Exception as e:
    print("Error connecting to WebSocket:", e)
