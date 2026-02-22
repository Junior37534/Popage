export interface HardwareData {
    cpu: {
        name: string
        temp: number
        clock: number
        usage: number
    }
    gpu: {
        name: string
        temp: number
        clock: number
        vramClock: number
        usage: number
        vramUsed: number
        vramTotal: number
        powerDraw: number
    }
    ram: {
        used: number
        total: number
        usage: number
    }
    battery: {
        percentage: number
        status: string
        isConservationEnabled: boolean
    }
    power: {
        cpuPackageW: number
        cpuCoreW: number
        cpuUncoreW: number
        gpuW: number
        totalW: number
        batteryW: number
        batteryDischarging: boolean
        acOnline: boolean
        batteryVoltage: number
        batteryEnergy: number
        batteryEnergyFull: number
        batteryCycleCount: number
    }
}

export interface GpuProcess {
    pid: number
    name: string
    memoryMiB: number
}

// IPC Channels
export const CHANNELS = {
    GET_HARDWARE_DATA: 'system:getHardwareData',
    GET_GPU_PROCESSES: 'system:getGpuProcesses',
    // Controls
    GET_POWER_PROFILE: 'system:getPowerProfile',
    SET_POWER_PROFILE: 'system:setPowerProfile',
    GET_GRAPHICS_MODE: 'system:getGraphicsMode',
    SET_GRAPHICS_MODE: 'system:setGraphicsMode',
    GET_NVIDIA_POWERMIZER: 'system:getNvidiaPowerMizer',
    SET_NVIDIA_POWERMIZER: 'system:setNvidiaPowerMizer',
    GET_BATTERY_CONSERVATION: 'system:getBatteryConservation',
    SET_BATTERY_CONSERVATION: 'system:setBatteryConservation'
}

