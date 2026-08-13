import { io, Socket } from 'socket.io-client'

export class SocketService {
    private socket: Socket | null = null
    private chatId: number | null = null
    private eventHandlers: Map<string, Set<(data: any) => void>> = new Map()

    connect(chatId: number, token: string): void {
        this.chatId = chatId

        const url = import.meta.env.VITE_IO_URL

        this.socket = io(url, {
            auth: { token },
            query: { token, chatId },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        })

        this.socket.on('connect', () => {
            console.log('Socket.IO подключен')

            this.socket?.emit('call', 'presence.joinRoom', { chatId }, (response: any) => {
                if (response?.success) {
                    this.emitEvent('connected', { chatId, status: 'connected' })
                } else {
                    this.emitEvent('error', { error: response?.error || 'Ошибка joinRoom' })
                }
            })
        })

        this.socket.on('disconnect', (reason) => {
            this.emitEvent('disconnect', { reason })
        })

        this.socket.on('connect_error', (error) => {
            this.emitEvent('error', { error: error.message })
        })

        this.socket.onAny((event: string, ...args: any[]) => {
            if (['connect', 'disconnect', 'connect_error', 'reconnect'].includes(event)) {
                return
            }
            this.emitEvent(event, args[0])
        })
    }

    disconnect(): void {
        if (this.socket) {
            if (this.chatId) {
                this.socket.emit('call', 'presence.leaveRoom', { chatId: this.chatId })
            }
            this.socket.disconnect()
            this.socket = null
        }
    }

    call<T = any>(action: string, data: any): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Socket.IO не подключен'))
                return
            }

            this.socket.emit('call', action, data, (response: any) => {
                if (response?.error) {
                    reject(new Error(response.error))
                } else {
                    resolve(response)
                }
            })
        })
    }

    on<T = any>(event: string, callback: (data: T) => void): () => void {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, new Set())
        }
        this.eventHandlers.get(event)!.add(callback)

        if (this.socket) {
            this.socket.on(event, callback as any)
        }

        return () => this.off(event, callback)
    }

    off(event: string, callback?: (data: any) => void): void {
        if (callback) {
            this.eventHandlers.get(event)?.delete(callback)
            if (this.socket) {
                this.socket.off(event, callback as any)
            }
        } else {
            this.eventHandlers.delete(event)
            if (this.socket) {
                this.socket.off(event)
            }
        }
    }

    emit(event: string, data: any): void {
        if (this.socket?.connected) {
            this.socket.emit(event, data)
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false
    }

    getChatId(): number | null {
        return this.chatId
    }

    private emitEvent(event: string, data: any): void {
        const handlers = this.eventHandlers.get(event)
        if (handlers) {
            for (const handler of handlers) {
                try {
                    handler(data)
                } catch (error) {
                    console.error(`Ошибка в обработчике ${event}:`, error)
                }
            }
        }
    }
}

export const socketService = new SocketService()