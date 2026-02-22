import { promises as fs } from 'fs'

export async function getRamData() {
    let used = 0
    let total = 0
    let usage = 0

    try {
        const meminfo = await fs.readFile('/proc/meminfo', 'utf-8')
        let memTotal = 0
        let memAvailable = 0

        meminfo.split('\n').forEach(line => {
            if (line.startsWith('MemTotal:')) {
                memTotal = parseInt(line.match(/\d+/)?.[0] || '0', 10)
            } else if (line.startsWith('MemAvailable:')) {
                memAvailable = parseInt(line.match(/\d+/)?.[0] || '0', 10)
            }
        })

        if (memTotal > 0) {
            const memUsedKb = memTotal - memAvailable
            total = memTotal / 1024 / 1024 // GB
            used = memUsedKb / 1024 / 1024 // GB
            usage = Math.round((memUsedKb / memTotal) * 100)
        }
    } catch (error) {
        console.error('Error fetching RAM data', error)
    }

    return { used, total, usage }
}
