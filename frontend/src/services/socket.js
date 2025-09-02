let socket = null;

export async function getSocket(baseUrl){
  if (socket) return socket;
  const { io } = await import('socket.io-client');
  const token = localStorage.getItem('token') || '';
  socket = io(baseUrl || '', {
    autoConnect: false,
    transports: ['websocket'],
    auth: { token }
  });
  socket.connect();
  return socket;
}

export function disconnectSocket(){
  if (socket){ socket.disconnect(); socket = null; }
}
