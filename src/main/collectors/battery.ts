import { promises as fs } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execFile)

export async function getBatteryData() {
    let percentage = 0
    let status = 'Unknown'
    let isConservationEnabled = false

    try {
        const batPath = '/sys/class/power_supply/BAT0'
        const capacityRaw = await fs.readFile(`${batPath}/capacity`, 'utf-8')
        percentage = parseInt(capacityRaw.trim(), 10)

        status = (await fs.readFile(`${batPath}/status`, 'utf-8')).trim()

        // Determine conservation mode
        // Lenovo laptops use ideapad_acpi
        try {
            const ideapadPath = '/sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode'
            const modeRaw = await fs.readFile(ideapadPath, 'utf-8')
            if (modeRaw.trim() === '1') {
                isConservationEnabled = true
            }
        } catch {
            try {
                const thresholdRaw = await fs.readFile(`${batPath}/charge_control_end_threshold`, 'utf-8')
                const threshold = parseInt(thresholdRaw.trim(), 10)
                if (threshold < 100) {
                    isConservationEnabled = true
                }
            } catch {
                // Fallback: check system76-power if file not found
                try {
                    const { stdout } = await exec('system76-power', ['charge-thresholds'])
                    if (stdout.includes('Profile: balanced') || stdout.includes('Profile: max_lifespan') || stdout.match(/End:\s*[678]\d/)) {
                        isConservationEnabled = true
                    }
                } catch (err) {
                    // Ignore errors if firmare doesn't support it
                }
            }
        }
    } catch (error) {
        console.error('Error fetching battery data:', error)
    }

    return { percentage, status, isConservationEnabled }
}
