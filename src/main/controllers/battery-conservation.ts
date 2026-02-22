import { execFile } from 'child_process'
import { promisify } from 'util'
import { promises as fs } from 'fs'

const exec = promisify(execFile)

export async function getBatteryConservationMode() {
    try {
        const ideapadPath = '/sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode'
        const modeRaw = await fs.readFile(ideapadPath, 'utf-8')
        return modeRaw.trim() === '1'
    } catch (error) {
        console.error('Error getting battery conservation mode:', error)
        return null
    }
}

export async function setBatteryConservationMode(enabled: boolean) {
    try {
        const val = enabled ? '1' : '0'
        const ideapadPath = '/sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode'
        await exec('pkexec', ['sh', '-c', `echo ${val} > ${ideapadPath}`])
        return { success: true }
    } catch (error: any) {
        console.error('Error setting battery conservation mode:', error)
        return { success: false, error: error.message }
    }
}
