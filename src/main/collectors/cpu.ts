import { promises as fs } from 'fs'

let previousCpuTimes = { idle: 0, total: 0 }
let cachedModelName = ''

export async function getCpuData() {
    let name = 'Unknown CPU'
    let temp = 0
    let clock = 0
    let usage = 0

    try {
        if (!cachedModelName) {
            const cpuinfo = await fs.readFile('/proc/cpuinfo', 'utf-8')
            const modelMatch = cpuinfo.match(/model name\s+:\s+(.+)/)
            if (modelMatch && modelMatch[1]) {
                const rawName = modelMatch[1].trim()
                const cpuMatch = rawName.match(/(i\d-\d+[A-Z]*)/)
                cachedModelName = cpuMatch ? cpuMatch[1] : rawName
            }
        }
        name = cachedModelName || 'Unknown CPU'

        // Temperature from thermal_zone8 (TCPU)
        const tempRaw = await fs.readFile('/sys/class/thermal/thermal_zone8/temp', 'utf-8')
        temp = parseInt(tempRaw.trim(), 10) / 1000

        // Clock speed from /proc/cpuinfo
        const cpuinfo = await fs.readFile('/proc/cpuinfo', 'utf-8')
        const clockMatch = cpuinfo.match(/cpu MHz\s+:\s+([\d.]+)/)
        if (clockMatch) {
            clock = parseFloat(clockMatch[1])
        }

        // Usage from /proc/stat
        const stat = await fs.readFile('/proc/stat', 'utf-8')
        const lines = stat.split('\n')
        const cpuLine = lines[0] // overall cpu
        if (cpuLine.startsWith('cpu ')) {
            const parts = cpuLine.split(/\s+/).slice(1).map(Number)
            const idle = parts[3]
            const total = parts.reduce((acc, val) => acc + val, 0)

            if (previousCpuTimes.total !== 0) {
                const idleDelta = idle - previousCpuTimes.idle
                const totalDelta = total - previousCpuTimes.total
                usage = Math.round((1 - idleDelta / totalDelta) * 100)
            }
            previousCpuTimes = { idle, total }
        }
    } catch (error) {
        console.error('Error fetching CPU data:', error)
    }

    return { name, temp, clock, usage }
}
