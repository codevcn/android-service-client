import { io, Socket } from "socket.io-client"

const SOCKET_URL = "http://localhost:8080/realtime" // Địa chỉ server Socket.IO

export const clientSocket: Socket = io(SOCKET_URL, {
   transports: ["websocket"], // Sử dụng WebSocket để giao tiếp
   autoConnect: false, // Tùy chỉnh: Không tự động kết nối khi import
})
