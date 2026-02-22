import { useState, useEffect, useCallback } from 'react'
import { Zap, Gamepad2, Cpu, Battery as BatteryIcon, BatteryFull, Scale, Rocket, Shuffle } from 'lucide-react'
import '../styles/components/controls.css'

type PowerProfile = 'battery' | 'balanced' | 'performance'
type GraphicsMode = 'hybrid' | 'nvidia' | 'integrated' | 'compute' | 'unknown'
type PowerMizerMode = 0 | 1 | 2

const POWERMIZER_LABELS: Record<number, string> = {
    0: 'Adaptive',
    1: 'Prefer Max Perf',
    2: 'Auto'
}

declare global {
    interface Window { api: any }
}

export function Controls() {
    const [powerProfile, setPowerProfile] = useState<PowerProfile | 'unknown'>('unknown')
    const [graphicsMode, setGraphicsMode] = useState<GraphicsMode>('unknown')
    const [powerMizer, setPowerMizer] = useState<PowerMizerMode | null>(null)
    const [conservationMode, setConservationMode] = useState<boolean | null>(null)

    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [errorMsg, setErrorMsg] = useState<string | null>(null)

    useEffect(() => {
        Promise.all([
            window.api.getPowerProfile(),
            window.api.getGraphicsMode(),
            window.api.getNvidiaPowerMizer(),
            window.api.getBatteryConservation()
        ]).then(([profile, gfx, pm, consv]) => {
            setPowerProfile(profile)
            setGraphicsMode(gfx)
            setPowerMizer(pm)
            setConservationMode(consv)
            setLoading(false)
        }).catch(err => {
            console.error('Failed to load controls', err)
            setLoading(false)
        })
    }, [])

    const handleSetProfile = useCallback(async (profile: PowerProfile) => {
        setActionLoading('profile')
        setErrorMsg(null)
        const result = await window.api.setPowerProfile(profile)
        if (result && result.success) setPowerProfile(profile)
        else setErrorMsg(result?.error || 'Failed to set power profile')
        setActionLoading(null)
    }, [])

    const handleSetGraphics = useCallback(async (mode: GraphicsMode) => {
        setActionLoading('graphics')
        setErrorMsg(null)
        const result = await window.api.setGraphicsMode(mode)
        if (result && result.success) setGraphicsMode(mode)
        else setErrorMsg(result?.error || 'Failed to set graphics mode')
        setActionLoading(null)
    }, [])

    const handleSetPowerMizer = useCallback(async (mode: PowerMizerMode) => {
        setActionLoading('powermizer')
        setErrorMsg(null)
        const result = await window.api.setNvidiaPowerMizer(mode)
        if (result && result.success) setPowerMizer(mode)
        else setErrorMsg(result?.error || 'Failed to set PowerMizer mode')
        setActionLoading(null)
    }, [])

    const handleSetConservation = useCallback(async () => {
        if (conservationMode === null) return
        setActionLoading('conservation')
        setErrorMsg(null)
        const newVal = !conservationMode
        const result = await window.api.setBatteryConservation(newVal)
        if (result && result.success) setConservationMode(newVal)
        else setErrorMsg(result?.error || 'Failed to set conservation mode')
        setActionLoading(null)
    }, [conservationMode])

    if (loading) {
        return (
            <div className="page-container">
                <h1 className="page-header">Controls</h1>
                <div className="control-loading">
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                    <span className="loading-dot" />
                    Loading system controls...
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            <h1 className="page-header">Controls</h1>

            {errorMsg && (
                <div style={{
                    padding: '12px 20px',
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid var(--danger)',
                    borderRadius: 10,
                    color: 'var(--danger)',
                    fontSize: 13,
                    marginBottom: 20
                }}>
                    {errorMsg}
                </div>
            )}

            <div className="controls-grid">
                {/* Power Profile */}
                <div className="control-card">
                    <div className="control-card-header">
                        <span className="control-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={16} /> Power Profile
                        </span>
                        <span className="control-current">Current: <strong>{powerProfile}</strong></span>
                    </div>
                    <div className="radio-group">
                        {(['battery', 'balanced', 'performance'] as PowerProfile[]).map((p) => (
                            <button
                                key={p}
                                className={`radio-option ${powerProfile === p ? 'active' : ''} ${actionLoading === 'profile' ? 'disabled' : ''}`}
                                onClick={() => handleSetProfile(p)}
                                disabled={actionLoading === 'profile'}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                {p === 'battery' ? <BatteryFull size={16} /> : p === 'balanced' ? <Scale size={16} /> : <Rocket size={16} />}
                                {p === 'battery' ? 'Battery' : p === 'balanced' ? 'Balanced' : 'Performance'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Graphics Mode */}
                <div className="control-card">
                    <div className="control-card-header">
                        <span className="control-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Gamepad2 size={16} /> Graphics Mode
                        </span>
                        <span className="control-current">Current: <strong>{graphicsMode}</strong></span>
                    </div>
                    <div className="radio-group">
                        {(['hybrid', 'nvidia', 'integrated', 'compute'] as GraphicsMode[]).map((m) => (
                            <button
                                key={m}
                                className={`radio-option ${graphicsMode === m ? 'active' : ''} ${actionLoading === 'graphics' ? 'disabled' : ''}`}
                                onClick={() => handleSetGraphics(m)}
                                disabled={actionLoading === 'graphics'}
                                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                                {m === 'hybrid' ? <Shuffle size={16} /> : m === 'nvidia' ? <Gamepad2 size={16} /> : m === 'integrated' ? <Cpu size={16} /> : <Zap size={16} />}
                                {m === 'hybrid' ? 'Hybrid' : m === 'nvidia' ? 'NVIDIA' : m === 'integrated' ? 'Integrated' : 'Compute'}
                            </button>
                        ))}
                    </div>
                    <div className="control-note">⚠️ Changing graphics mode requires a reboot</div>
                </div>

                {/* NVIDIA PowerMizer */}
                <div className="control-card">
                    <div className="control-card-header">
                        <span className="control-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Cpu size={16} /> NVIDIA PowerMizer
                        </span>
                        <span className="control-current">
                            Current: <strong>{powerMizer !== null ? POWERMIZER_LABELS[powerMizer] : 'Unknown'}</strong>
                        </span>
                    </div>
                    <div className="radio-group">
                        {([0, 1, 2] as PowerMizerMode[]).map((m) => (
                            <button
                                key={m}
                                className={`radio-option ${powerMizer === m ? 'active' : ''} ${actionLoading === 'powermizer' || powerMizer === null ? 'disabled' : ''}`}
                                onClick={() => handleSetPowerMizer(m)}
                                disabled={actionLoading === 'powermizer' || powerMizer === null}
                            >
                                {POWERMIZER_LABELS[m]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Battery Conservation */}
                <div className="control-card">
                    <div className="control-card-header">
                        <span className="control-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BatteryIcon size={16} /> Battery Conservation
                        </span>
                    </div>
                    <div className="conservation-row">
                        <div className="conservation-info">
                            <span className="conservation-label">Conservation Mode</span>
                            <span className="conservation-desc">
                                {conservationMode ? 'On' : 'Off'}
                            </span>
                        </div>
                        <div
                            className={`toggle-switch ${conservationMode ? 'active' : ''} ${actionLoading === 'conservation' || conservationMode === null ? 'disabled' : ''}`}
                            onClick={(actionLoading === 'conservation' || conservationMode === null) ? undefined : handleSetConservation}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
