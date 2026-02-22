import { contextBridge, ipcRenderer } from 'electron'
import { CHANNELS } from '../shared/ipc-channels'

const api = {
    getHardwareData: () => ipcRenderer.invoke(CHANNELS.GET_HARDWARE_DATA),
    getGpuProcesses: () => ipcRenderer.invoke(CHANNELS.GET_GPU_PROCESSES),
    getPowerProfile: () => ipcRenderer.invoke(CHANNELS.GET_POWER_PROFILE),
    setPowerProfile: (profile: string) => ipcRenderer.invoke(CHANNELS.SET_POWER_PROFILE, profile),
    getGraphicsMode: () => ipcRenderer.invoke(CHANNELS.GET_GRAPHICS_MODE),
    setGraphicsMode: (mode: string) => ipcRenderer.invoke(CHANNELS.SET_GRAPHICS_MODE, mode),
    getNvidiaPowerMizer: () => ipcRenderer.invoke(CHANNELS.GET_NVIDIA_POWERMIZER),
    setNvidiaPowerMizer: (mode: number) => ipcRenderer.invoke(CHANNELS.SET_NVIDIA_POWERMIZER, mode),
    getBatteryConservation: () => ipcRenderer.invoke(CHANNELS.GET_BATTERY_CONSERVATION),
    setBatteryConservation: (enabled: boolean) => ipcRenderer.invoke(CHANNELS.SET_BATTERY_CONSERVATION, enabled)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore
    window.api = api
}
