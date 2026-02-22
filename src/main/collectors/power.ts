import { promises as fs } from 'fs'
import { execFile } from 'child_process'
import { promisify } from 'util'

const exec = promisify(execFile)

// RAPL energy counters - sampled over time to calculate watts
let prevRaplPackage = 0
let prevRaplCore = 0
let prevRaplUncore = 0
let prevRaplTimestamp = 0

async function readRaplEnergy(path: string): Promise<number> {
    try {
        // Try direct read first
        const raw = await fs.readFile(path, 'utf-8')
        return parseInt(raw.trim(), 10)
    } catch {
        // Needs root - use pkexec cat
        try {
            const { stdout } = await exec('cat', [path])
            return parseInt(stdout.trim(), 10)
        } catch {
            return -1
        }
    }
}

export async function getPowerData(gpuPowerDraw: number) {
    let cpuPackageW = 0
    let cpuCoreW = 0
    let cpuUncoreW = 0
    let batteryW = 0
    let batteryDischarging = false
    let acOnline = false
    let batteryVoltage = 0
    let batteryEnergy = 0
    let batteryEnergyFull = 0
    let batteryCycleCount = 0

    // === Battery / AC info ===
    try {
        const statusRaw = await fs.readFile('/sys/class/power_supply/BAT0/status', 'utf-8')
        batteryDischarging = statusRaw.trim() === 'Discharging'

        const powerNowRaw = await fs.readFile('/sys/class/power_supply/BAT0/power_now', 'utf-8')
        batteryW = parseInt(powerNowRaw.trim(), 10) / 1000000 // microwatts -> watts

        const voltageRaw = await fs.readFile('/sys/class/power_supply/BAT0/voltage_now', 'utf-8')
        batteryVoltage = parseInt(voltageRaw.trim(), 10) / 1000000 // microvolts -> volts

        const energyNowRaw = await fs.readFile('/sys/class/power_supply/BAT0/energy_now', 'utf-8')
        batteryEnergy = parseInt(energyNowRaw.trim(), 10) / 1000000 // microwatt-hours -> Wh

        const energyFullRaw = await fs.readFile('/sys/class/power_supply/BAT0/energy_full', 'utf-8')
        batteryEnergyFull = parseInt(energyFullRaw.trim(), 10) / 1000000

        const cycleRaw = await fs.readFile('/sys/class/power_supply/BAT0/cycle_count', 'utf-8')
        batteryCycleCount = parseInt(cycleRaw.trim(), 10)
    } catch {
        // Battery data unavailable
    }

    try {
        const acRaw = await fs.readFile('/sys/class/power_supply/ADP0/online', 'utf-8')
        acOnline = acRaw.trim() === '1'
    } catch {
        // AC data unavailable
    }

    // === RAPL CPU Power (Intel Running Average Power Limit) ===
    const now = Date.now()
    const raplPackage = await readRaplEnergy('/sys/class/powercap/intel-rapl:0/energy_uj')
    const raplCore = await readRaplEnergy('/sys/class/powercap/intel-rapl:0:0/energy_uj')
    const raplUncore = await readRaplEnergy('/sys/class/powercap/intel-rapl:0:1/energy_uj')

    if (prevRaplTimestamp > 0 && raplPackage >= 0) {
        const dtSeconds = (now - prevRaplTimestamp) / 1000
        if (dtSeconds > 0 && dtSeconds < 10) {
            // energy_uj is in microjoules. Delta / dt = microwatts, divide by 1e6 for watts
            if (raplPackage >= prevRaplPackage) {
                cpuPackageW = (raplPackage - prevRaplPackage) / 1000000 / dtSeconds
            }
            if (raplCore >= prevRaplCore) {
                cpuCoreW = (raplCore - prevRaplCore) / 1000000 / dtSeconds
            }
            if (raplUncore >= prevRaplUncore) {
                cpuUncoreW = (raplUncore - prevRaplUncore) / 1000000 / dtSeconds
            }
        }
    }

    prevRaplPackage = raplPackage
    prevRaplCore = raplCore
    prevRaplUncore = raplUncore
    prevRaplTimestamp = now

    // === Total system power estimate ===
    let totalW = 0
    if (batteryDischarging && batteryW > 0) {
        // When on battery, power_now is the real draw from the battery
        totalW = batteryW
    } else {
        // On AC: sum CPU package + GPU + system overhead
        totalW = cpuPackageW + gpuPowerDraw + 8 // ~8W for memory, fans, display, etc.
    }

    return {
        cpuPackageW: Math.round(cpuPackageW * 10) / 10,
        cpuCoreW: Math.round(cpuCoreW * 10) / 10,
        cpuUncoreW: Math.round(cpuUncoreW * 10) / 10,
        gpuW: Math.round(gpuPowerDraw * 10) / 10,
        totalW: Math.round(totalW * 10) / 10,
        batteryW: Math.round(batteryW * 10) / 10,
        batteryDischarging,
        acOnline,
        batteryVoltage: Math.round(batteryVoltage * 100) / 100,
        batteryEnergy: Math.round(batteryEnergy * 10) / 10,
        batteryEnergyFull: Math.round(batteryEnergyFull * 10) / 10,
        batteryCycleCount
    }
}
