import { useState, useEffect, useCallback } from 'react'
import type { HardwareData, GpuProcess } from '../../shared/ipc-channels'

interface UseHardwareDataReturn {
    data: HardwareData | null
    gpuProcesses: GpuProcess[]
    isLoading: boolean
    error: string | null
}

const getStoredRate = () => {
    const r = localStorage.getItem('popage-refresh')
    return r ? parseInt(r, 10) : 2000
}

export function useHardwareData(): UseHardwareDataReturn {
    const [intervalMs, setIntervalMs] = useState(getStoredRate())
    const [data, setData] = useState<HardwareData | null>(null)
    const [gpuProcesses, setGpuProcesses] = useState<GpuProcess[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const h = () => setIntervalMs(getStoredRate())
        window.addEventListener('popage-settings-updated', h)
        return () => window.removeEventListener('popage-settings-updated', h)
    }, [])

    const fetchData = useCallback(async () => {
        try {
            const hwData = await window.api.getHardwareData()
            setData(hwData)
            const procs = await window.api.getGpuProcesses()
            setGpuProcesses(procs)
            setError(null)
        } catch (err: any) {
            console.error('Failed to fetch hardware data', err)
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
        const timer = setInterval(fetchData, intervalMs)
        return () => clearInterval(timer)
    }, [fetchData, intervalMs])

    return { data, gpuProcesses, isLoading, error }
}
