import type { HardwareData, GpuProcess } from '../shared/ipc-channels'

declare global {
    interface Window {
        api: {
            getHardwareData: () => Promise<HardwareData>
            getGpuProcesses: () => Promise<GpuProcess[]>
            getPowerProfile: () => Promise<string>
            setPowerProfile: (profile: 'battery' | 'balanced' | 'performance') => Promise<{ success: boolean, error?: string }>
            getGraphicsMode: () => Promise<string>
            setGraphicsMode: (mode: 'hybrid' | 'nvidia' | 'integrated' | 'compute') => Promise<{ success: boolean, requiresReboot?: boolean, error?: string }>
            getNvidiaPowerMizer: () => Promise<number | null>
            setNvidiaPowerMizer: (mode: 0 | 1 | 2) => Promise<{ success: boolean, error?: string }>
            getBatteryConservation: () => Promise<boolean | null>
            setBatteryConservation: (enabled: boolean) => Promise<{ success: boolean, error?: string }>
        }
    }
}

export { }
