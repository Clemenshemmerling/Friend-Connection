import json
import logging
from fastapi import WebSocket
from typing import Dict
from uuid import uuid4
import asyncio

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[WebSocket, str] = {}
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        async with self.lock:
            await websocket.accept()
            if websocket not in self.active_connections:
                connection_id = str(uuid4())  # Generar un ID único para esta conexión
                self.active_connections[websocket] = connection_id
                logger.debug(f"WebSocket connection accepted and added with ID {connection_id}. Total connections: {len(self.active_connections)}")
                return connection_id
            else:
                logger.debug("WebSocket connection attempt from already connected client.")

    async def disconnect(self, websocket: WebSocket):
        async with self.lock:
            if websocket in self.active_connections:
                connection_id = self.active_connections[websocket]
                del self.active_connections[websocket]
                logger.debug(f"WebSocket connection with ID {connection_id} removed from active connections. Remaining connections: {len(self.active_connections)}")
            else:
                logger.debug("Attempted to disconnect a non-existent connection.")
    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)
    async def broadcast(self, message: dict):
        message_json = json.dumps(message)
        logger.debug("Enter to broadcast.")
        async with self.lock:
            if not self.active_connections:
                logger.warning("No active WebSocket connections to broadcast to.")
            connections_to_remove = []
            for websocket in list(self.active_connections.keys()):
                await websocket.send_text(message_json)

                try:
                    if websocket.client_state == WebSocket.OPEN:
                        logger.info(f"Sending message to client with ID {self.active_connections[websocket]}: {message_json}")
                    else:
                        connections_to_remove.append(websocket)
                        logger.warning("Skipping closed or not ready WebSocket connection.")
                except Exception as e:
                    logger.error(f"Error in sending message to a client: {e}")
                    connections_to_remove.append(websocket)
            for conn in connections_to_remove:
                if conn in self.active_connections:
                    await self.disconnect(conn)

manager = ConnectionManager()
