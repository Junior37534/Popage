import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execFile)

export async function getGpuData() {
    let name = 'Unknown GPU'
    let temp = 0
    let clock = 0
    let vramClock = 0
    let usage = 0
    let vramUsed = 0
    let vramTotal = 0
    let powerDraw = 0

    try {
        const { stdout } = await exec('nvidia-smi', [
            '--query-gpu=name,temperature.gpu,clocks.current.graphics,clocks.current.memory,utilization.gpu,memory.used,memory.total,power.draw',
            '--format=csv,noheader,nounits'
        ])

        const parts = stdout.trim().split(', ')
        if (parts.length >= 8) {
            const rawName = parts[0]
            const gpuMatch = rawName.match(/(RTX\s*\d+)/i)
            name = gpuMatch ? gpuMatch[1].replace(/\s+/g, '') : rawName
            temp = parseInt(parts[1], 10)
            clock = parseInt(parts[2], 10)
            vramClock = parseInt(parts[3], 10)
            usage = parseInt(parts[4], 10)
            vramUsed = parseInt(parts[5], 10) / 1024 // Convert MiB to GB
            vramTotal = parseInt(parts[6], 10) / 1024
            powerDraw = parseFloat(parts[7])
        }
    } catch (error) {
        console.error('Error fetching GPU data:', error)
    }

    return {
        name,
        temp,
        clock,
        vramClock,
        usage,
        vramUsed,
        vramTotal,
        powerDraw
    }
}

export async function getGpuProcesses() {
    try {
        // pmon captures both compute AND graphics (Xorg) processes
        const { stdout } = await exec('nvidia-smi', ['pmon', '-c', '1', '-s', 'u'])

        if (!stdout.trim()) return []

        const lines = stdout.trim().split('\n')
        const processes: { pid: number, name: string, memoryMiB: number }[] = []

        // Format is: gpu pid type sm mem enc dec jpg ofa command
        for (const line of lines) {
            if (line.startsWith('#') || !line.trim()) continue;

            // Split by multiple spaces
            const parts = line.trim().split(/\s+/)
            if (parts.length >= 8) {
                const pid = parseInt(parts[1], 10)
                const command = parts.slice(9).join(' ') // Anything after column 9 is the name

                // pmon doesn't reliably report raw MB easily on all versions for usage in 'u' flag without 'm' flag.
                // We'll use another query to get exactly the memory for all PIDs.
                processes.push({
                    pid,
                    name: command || 'Unknown',
                    memoryMiB: 0 // Will populate below
                })
            }
        }

        // pmon -s m gives fb memory per process (including Xorg and other graphics processes)
        const { stdout: fbStdout } = await exec('nvidia-smi', ['pmon', '-c', '1', '-s', 'm'])

        const memLines = fbStdout.trim().split('\n')
        for (const line of memLines) {
            if (line.startsWith('#') || !line.trim()) continue;
            const parts = line.trim().split(/\s+/)
            if (parts.length >= 4) {
                const pid = parseInt(parts[1], 10)
                const fbMem = parseInt(parts[3], 10) // fb column
                const proj = processes.find(p => p.pid === pid)
                if (proj && !isNaN(fbMem)) {
                    proj.memoryMiB = fbMem
                }
            }
        }

        return processes
    } catch (error) {
        console.error('Error fetching GPU processes:', error)
        return []
    }
}
