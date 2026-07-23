
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const prisma = new PrismaClient()

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

  const io = new SocketIOServer(httpServer, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    socket.on('authenticate', async (data: { userId: string }) => {
      try {
        if (!data?.userId) {
          socket.emit('auth:error', 'Missing userId')
          return
        }

        const user = await prisma.user.findUnique({
          where: { id: data.userId },
          select: { id: true, name: true, email: true, image: true, vipLevel: true, role: true }
        })

        if (!user) {
          socket.emit('auth:error', 'User not found')
          return
        }

        // @ts-expect-error custom socket properties
        socket.userId = user.id
        // @ts-expect-error custom socket properties
        socket.userName = user.name
        // @ts-expect-error custom socket properties
        socket.userEmail = user.email
        // @ts-expect-error custom socket properties
        socket.userImage = user.image
        // @ts-expect-error custom socket properties
        socket.userVipLevel = user.vipLevel
        // @ts-expect-error custom socket properties
        socket.userRole = user.role

        socket.emit('auth:success', { userId: user.id })
      } catch {
        socket.emit('auth:error', 'Auth failed')
      }
    })

    socket.on('chat:send', (data: { message: string; roomId?: string }) => {
      // @ts-expect-error custom socket property
      if (!socket.userId) {
        socket.emit('chat:error', 'Unauthorized')
        return
      }

      const messageContent = data?.message?.trim()
      if (!messageContent || messageContent.length > 500) return

      const message = {
        id: `${Date.now()}-${socket.id}`,
        message: messageContent,
        isSystem: false,
        createdAt: new Date().toISOString(),
        user: {
          // @ts-expect-error custom socket property
          name: socket.userName || 'User',
          // @ts-expect-error custom socket property
          image: socket.userImage || null,
          // @ts-expect-error custom socket property
          vipLevel: socket.userVipLevel || 'BRONZE',
          // @ts-expect-error custom socket property
          role: socket.userRole || 'USER',
        }
      }

      io.emit('chat:message', message)
    })

    socket.on('disconnect', () => {
      // disconnected
    })
  })

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> WebSocket Server ready on path /socket.io`)
  })
})
