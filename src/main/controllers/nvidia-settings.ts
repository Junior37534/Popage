import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execFile)

export async function getNvidiaPowerMizerMode() {
    try {
        const { stdout } = await exec('nvidia-settings', ['-q', '[gpu:0]/GPUPowerMizerMode', '-t'])
        return parseInt(stdout.trim(), 10)
    } catch (error) {
        console.error('Error getting NVIDIA PowerMizer mode:', error)
        return null
    }
}

export async function setNvidiaPowerMizerMode(mode: 0 | 1 | 2) {
    try {
        await exec('nvidia-settings', ['-a', `[gpu:0]/GPUPowerMizerMode=${mode}`])
        return { success: true }
    } catch (error: any) {
        console.error('Error setting NVIDIA PowerMizer mode:', error)
        return { success: false, error: error.message }
    }
}
