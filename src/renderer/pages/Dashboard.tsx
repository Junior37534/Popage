
import { useHardwareData } from '../hooks/useHardwareData'
import { GaugeChart } from '../components/GaugeChart'
import { BatteryBar } from '../components/BatteryBar'
import { ProcessList } from '../components/ProcessList'
import { Activity } from 'lucide-react'

export function Dashboard() {
    const { data, gpuProcesses, isLoading, error } = useHardwareData()

    if (isLoading) {
        return (
            <div className="page" style={styles.loading}>
                <Activity size={48} color="var(--accent)" className="loading-spinner" />
                <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Gathering system metrics...</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="page" style={styles.error}>
                <h2>Error connecting to background service</h2>
                <p>{error}</p>
            </div>
        )
    }

    return (
        <div className="page" style={styles.dashboard}>
            <header style={styles.header}>
                <h1 style={{ margin: 0 }}>Hardware Monitor</h1>
                <div style={styles.powerPill}>
                    ⚡ {data.power.totalW}W
                    <span style={styles.gpuPower}>
                        {data.power.acOnline ? '🔌 AC' : '🔋 Battery'}
                    </span>
                </div>
            </header>

            <div style={styles.gaugesRow}>
                <GaugeChart
                    label={data.cpu.name || "CPU"}
                    value={Math.round(data.cpu.temp)}
                    unit="°C"
                    percentage={(data.cpu.temp / 100) * 100}
                    subLable1="Clock"
                    subValue1={`${(data.cpu.clock / 1000).toFixed(1)} GHz`}
                    subLable2="Usage"
                    subValue2={`${data.cpu.usage}%`}
                />
                <GaugeChart
                    label={data.gpu.name || "GPU"}
                    value={Math.round(data.gpu.temp)}
                    unit="°C"
                    percentage={(data.gpu.temp / 90) * 100}
                    subLable1="Clock"
                    subValue1={`${data.gpu.clock} MHz`}
                    subLable2="Usage"
                    subValue2={`${data.gpu.usage}%`}
                />
                <GaugeChart
                    label="VRAM"
                    value={Math.round((data.gpu.vramUsed / data.gpu.vramTotal) * 100) || 0}
                    unit="%"
                    percentage={(data.gpu.vramUsed / data.gpu.vramTotal) * 100 || 0}
                    subLable1="Used"
                    subValue1={`${data.gpu.vramUsed.toFixed(1)} GB`}
                    subLable2="Clock"
                    subValue2={`${data.gpu.vramClock} MHz`}
                />
                <GaugeChart
                    label="RAM"
                    value={data.ram.usage}
                    unit="%"
                    percentage={data.ram.usage}
                    subLable1="Used"
                    subValue1={`${data.ram.used.toFixed(1)} GB`}
                    subLable2="Total"
                    subValue2={`${data.ram.total.toFixed(1)} GB`}
                />
            </div>

            {/* Power Metrics Panel */}
            <div style={styles.powerPanel}>
                <div style={styles.powerPanelHeader}>
                    <span style={styles.powerPanelTitle}>⚡ Power Consumption</span>
                    <span style={styles.powerPanelTotal}>{data.power.totalW}W Total</span>
                </div>
                <div style={styles.powerGrid}>
                    <div style={styles.powerItem}>
                        <div style={styles.powerItemLabel}>CPU Package</div>
                        <div style={styles.powerItemValue}>{data.power.cpuPackageW}W</div>
                        <div style={styles.powerBar}>
                            <div style={{ ...styles.powerBarFill, width: `${Math.min((data.power.cpuPackageW / 55) * 100, 100)}%`, background: 'linear-gradient(90deg, #6b8afd, #a78bfa)' }} />
                        </div>
                    </div>
                    <div style={styles.powerItem}>
                        <div style={styles.powerItemLabel}>CPU Cores</div>
                        <div style={styles.powerItemValue}>{data.power.cpuCoreW}W</div>
                        <div style={styles.powerBar}>
                            <div style={{ ...styles.powerBarFill, width: `${Math.min((data.power.cpuCoreW / 45) * 100, 100)}%`, background: 'linear-gradient(90deg, #48b9c7, #6b8afd)' }} />
                        </div>
                    </div>
                    <div style={styles.powerItem}>
                        <div style={styles.powerItemLabel}>iGPU / Uncore</div>
                        <div style={styles.powerItemValue}>{data.power.cpuUncoreW}W</div>
                        <div style={styles.powerBar}>
                            <div style={{ ...styles.powerBarFill, width: `${Math.min((data.power.cpuUncoreW / 15) * 100, 100)}%`, background: 'linear-gradient(90deg, #a78bfa, #f0abfc)' }} />
                        </div>
                    </div>
                    <div style={styles.powerItem}>
                        <div style={styles.powerItemLabel}>dGPU ({data.gpu.name || 'GPU'})</div>
                        <div style={styles.powerItemValue}>{data.power.gpuW}W</div>
                        <div style={styles.powerBar}>
                            <div style={{ ...styles.powerBarFill, width: `${Math.min((data.power.gpuW / 55) * 100, 100)}%`, background: 'linear-gradient(90deg, #34d399, #48b9c7)' }} />
                        </div>
                    </div>
                </div>
                <div style={styles.powerFooter}>
                    <div style={styles.powerFooterItem}>
                        <span style={styles.footerLabel}>Battery</span>
                        <span style={styles.footerValue}>
                            {data.power.batteryDischarging ? `−${data.power.batteryW}W` : data.battery.status}
                        </span>
                    </div>
                    <div style={styles.powerFooterItem}>
                        <span style={styles.footerLabel}>Voltage</span>
                        <span style={styles.footerValue}>{data.power.batteryVoltage}V</span>
                    </div>
                    <div style={styles.powerFooterItem}>
                        <span style={styles.footerLabel}>Energy</span>
                        <span style={styles.footerValue}>{data.power.batteryEnergy}/{data.power.batteryEnergyFull} Wh</span>
                    </div>
                    <div style={styles.powerFooterItem}>
                        <span style={styles.footerLabel}>Cycles</span>
                        <span style={styles.footerValue}>{data.power.batteryCycleCount}</span>
                    </div>
                </div>
            </div>

            <div style={styles.bottomRow}>
                <BatteryBar
                    percentage={data.battery.percentage}
                    status={data.battery.status}
                    isConservationEnabled={data.battery.isConservationEnabled}
                />
                <ProcessList
                    title="dGPU Processes"
                    processes={gpuProcesses}
                />
            </div>
        </div>
    )
}

const styles = {
    dashboard: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '32px',
        height: '100%'
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    powerPill: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--bg-tertiary)',
        padding: '8px 16px',
        borderRadius: '24px',
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        border: '1px solid var(--border)'
    },
    gpuPower: {
        color: 'var(--text-secondary)',
        fontWeight: 400
    },
    gaugesRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '24px'
    },
    bottomRow: {
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap' as const
    },
    powerPanel: {
        backgroundColor: 'var(--bg-secondary)',
        padding: '20px 24px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
    },
    powerPanelHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
    },
    powerPanelTitle: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-primary)'
    },
    powerPanelTotal: {
        fontSize: '18px',
        fontWeight: 700,
        color: 'var(--accent)'
    },
    powerGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '16px'
    },
    powerItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px'
    },
    powerItemLabel: {
        fontSize: '11px',
        fontWeight: 500,
        color: 'var(--text-secondary)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.05em'
    },
    powerItemValue: {
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--text-primary)'
    },
    powerBar: {
        height: '4px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '2px',
        overflow: 'hidden' as const,
        marginTop: '4px'
    },
    powerBarFill: {
        height: '100%',
        borderRadius: '2px',
        transition: 'width 0.5s ease-in-out'
    },
    powerFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border)',
        paddingTop: '12px'
    },
    powerFooterItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: '2px'
    },
    footerLabel: {
        fontSize: '11px',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em'
    },
    footerValue: {
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-primary)'
    },
    loading: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%'
    },
    error: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: 'var(--danger)'
    }
}
