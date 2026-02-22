import { spawn, ChildProcess } from 'child_process'
import { join } from 'path'
import { app } from 'electron'
import { randomUUID } from 'crypto'

class PrivilegedHelper {
    private worker: ChildProcess | null = null
    private pendingRequests: Map<string, { resolve: (val: any) => void; reject: (err: any) => void }> = new Map()

    async init(): Promise<boolean> {
        if (this.worker && !this.worker.killed) {
            return true
        }

        return new Promise((resolve) => {
            let workerPath = ''
            if (app.isPackaged) {
                workerPath = join(process.resourcesPath, 'app.asar.unpacked', 'src', 'main', 'privileged-worker.js')
            } else {
                workerPath = join(__dirname, '../../src/main/privileged-worker.js')
            }

            const nodePath = process.execPath.includes('electron')
                ? '/usr/bin/node'
                : process.execPath

            // Spawn using pkexec to get root privileges.
            this.worker = spawn('pkexec', [nodePath, workerPath], {
                stdio: ['pipe', 'pipe', 'pipe']
            })

            let isReady = false
            let buffer = ''

            // Handle successful spawn and initial stdout
            this.worker.stdout?.on('data', (data) => {
                buffer += data.toString()
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (!line.trim()) continue
                    try {
                        const response = JSON.parse(line)
                        if (response.type === 'ready') {
                            if (!isReady) {
                                isReady = true
                                resolve(true)
                            }
                            continue
                        }
                        const req = this.pendingRequests.get(response.id)
                        if (req) {
                            if (response.success) {
                                req.resolve(response.data)
                            } else {
                                req.reject(new Error(response.error))
                            }
                            this.pendingRequests.delete(response.id)
                        }
                    } catch (e) {
                        console.error('Failed to parse privileged worker response:', line)
                    }
                }
            })

            this.worker.stderr?.on('data', (data) => {
                console.error(`[Privileged Worker Error]: ${data}`)
            })

            this.worker.on('close', (code) => {
                console.log(`Privileged worker exited with code ${code}`)
                this.worker = null
                isReady = false
                resolve(false) // Resolve false if it exited immediately (e.g. auth failed)

                // Reject all pending requests
                for (const [id, req] of this.pendingRequests.entries()) {
                    req.reject(new Error('Privileged helper disconnected'))
                    this.pendingRequests.delete(id)
                }
            })

            this.worker.on('error', (err) => {
                console.error('Failed to start privileged worker:', err)
                if (!isReady) {
                    resolve(false)
                }
            })

            // Timeout for initial auth wait (30 seconds for polkit prompt)
            setTimeout(() => {
                if (!isReady) {
                    // Timeout hit, we did not get a ready signal
                    if (this.worker) this.worker.kill()
                    resolve(false)
                }
            }, 30000)
        })
    }

    isReady(): boolean {
        return this.worker !== null && !this.worker.killed
    }

    async execute(action: string, payload: any = {}): Promise<any> {
        if (!this.isReady()) {
            throw new Error('Privileged helper is not running. Please authenticate first.')
        }

        return new Promise((resolve, reject) => {
            const id = randomUUID()
            this.pendingRequests.set(id, { resolve, reject })

            const message = JSON.stringify({ id, action, payload }) + '\n'
            this.worker?.stdin?.write(message, (error) => {
                if (error) {
                    this.pendingRequests.delete(id)
                    reject(error)
                }
            })
        })
    }

    destroy(): void {
        if (this.worker) {
            this.worker.kill()
            this.worker = null
        }
    }
}

export const privilegedHelper = new PrivilegedHelper()
