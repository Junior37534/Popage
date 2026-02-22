import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execFile)

export async function getPowerProfile() {
    try {
        const { stdout } = await exec('system76-power', ['profile'])
        const match = stdout.match(/Power Profile:\s+(\w+)/i)
        if (match) {
            return match[1].toLowerCase()
        }
        return 'unknown'
    } catch (error) {
        console.error('Error getting power profile:', error)
        return 'unknown'
    }
}

export async function setPowerProfile(profile: 'battery' | 'balanced' | 'performance') {
    try {
        await exec('pkexec', ['system76-power', 'profile', profile])
        return { success: true }
    } catch (error: any) {
        console.error('Error setting power profile:', error)
        return { success: false, error: error.message }
    }
}
