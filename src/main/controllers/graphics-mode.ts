import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execFile)

export async function getGraphicsMode() {
    try {
        const { stdout } = await exec('system76-power', ['graphics'])
        const match = stdout.match(/([\w]+)/)
        if (match) {
            return match[1].toLowerCase()
        }
        return 'unknown'
    } catch (error) {
        console.error('Error getting graphics mode:', error)
        return 'unknown'
    }
}

export async function setGraphicsMode(mode: 'hybrid' | 'nvidia' | 'integrated' | 'compute') {
    try {
        await exec('pkexec', ['system76-power', 'graphics', mode])
        return { success: true, requiresReboot: true }
    } catch (error: any) {
        console.error('Error setting graphics mode:', error)
        return { success: false, error: error.message }
    }
}
