from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from .routes import router
from .connection_manager import ConnectionManager
from starlette.websockets import WebSocketDisconnect

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

manager = ConnectionManager()

@app.get('/')
def hello_world():
    return {'hello': 'world'}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    connection_id = await manager.connect(websocket)
    try:
        await websocket.send_json({"message": "Connected", "connection_id": connection_id})
        while True:
            data = await websocket.receive_text()
            await websocket.send_text("pong")
    except WebSocketDisconnect as e:
        print(f"WebSocket disconnected with error code: {e.code}")
    finally:
        if websocket in manager.active_connections:
            await manager.disconnect(websocket)
        print(f"WebSocket connection {connection_id} closed properly")
