import { ipcMain } from 'electron'
import { CHANNELS, HardwareData } from '../shared/ipc-channels'

// Collectors
import { getCpuData } from './collectors/cpu'
import { getGpuData, getGpuProcesses } from './collectors/gpu'
import { getRamData } from './collectors/ram'
import { getBatteryData } from './collectors/battery'
import { getPowerData } from './collectors/power'

// Controllers
import { getPowerProfile, setPowerProfile } from './controllers/power-profile'
import { getGraphicsMode, setGraphicsMode } from './controllers/graphics-mode'
import { getNvidiaPowerMizerMode, setNvidiaPowerMizerMode } from './controllers/nvidia-settings'
import { getBatteryConservationMode, setBatteryConservationMode } from './controllers/battery-conservation'

export function setupIpcHandlers(): void {
    // Aggregate hardware data
    ipcMain.handle(CHANNELS.GET_HARDWARE_DATA, async (): Promise<HardwareData> => {
        const [cpu, gpu, ram, battery] = await Promise.all([
            getCpuData(),
            getGpuData(),
            getRamData(),
            getBatteryData()
        ])

        const power = await getPowerData(gpu.powerDraw)

        return { cpu, gpu, ram, battery, power }
    })

    // GPU Processes
    ipcMain.handle(CHANNELS.GET_GPU_PROCESSES, async () => {
        return await getGpuProcesses()
    })

    // Controls getters
    ipcMain.handle(CHANNELS.GET_POWER_PROFILE, async () => await getPowerProfile())
    ipcMain.handle(CHANNELS.GET_GRAPHICS_MODE, async () => await getGraphicsMode())
    ipcMain.handle(CHANNELS.GET_NVIDIA_POWERMIZER, async () => await getNvidiaPowerMizerMode())
    ipcMain.handle(CHANNELS.GET_BATTERY_CONSERVATION, async () => await getBatteryConservationMode())

    // Controls setters
    ipcMain.handle(CHANNELS.SET_POWER_PROFILE, async (_, profile) => await setPowerProfile(profile))
    ipcMain.handle(CHANNELS.SET_GRAPHICS_MODE, async (_, mode) => await setGraphicsMode(mode))
    ipcMain.handle(CHANNELS.SET_NVIDIA_POWERMIZER, async (_, mode) => await setNvidiaPowerMizerMode(mode))
    ipcMain.handle(CHANNELS.SET_BATTERY_CONSERVATION, async (_, enabled) => await setBatteryConservationMode(enabled))
}
