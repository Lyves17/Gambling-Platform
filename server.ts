
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { verify } from 'jsonwebtoken'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    // console.log(`[Socket] Client connected: ${socket.id}`)

    socket.on('authenticate', (token: string) => {
      try {
        if (!process.env.NEXTAUTH_SECRET) return
        const decoded = verify(token, process.env.NEXTAUTH_SECRET) as { sub: string; email: string }
        // @ts-expect-error -- custom socket property not in Socket type def
        socket.userId = decoded.sub
        // @ts-expect-error -- custom socket property
        socket.userEmail = decoded.email
        socket.emit('auth:success', { userId: decoded.sub })
      } catch {
        socket.emit('auth:error', 'Invalid token')
      }
    })

    socket.on('chat:send', (data) => {
      // @ts-expect-error -- custom socket property
      if (!socket.userId) {
        socket.emit('chat:error', 'Unauthorized')
        return
      }

      const message = {
        id: Date.now().toString(),
        // @ts-expect-error -- custom socket property
        userId: socket.userId,
        // @ts-expect-error -- custom socket property
        userEmail: socket.userEmail,
        ...data,
        timestamp: new Date()
      }

      // Broadcast to everyone
      io.emit('chat:message', message)
    })

    socket.on('disconnect', () => {
      // console.log(`[Socket] Client disconnected: ${socket.id}`)
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket Server ready on path /socket.io`)
  })
})
