import { Battery, BatteryCharging, BatteryWarning, BatteryFull } from 'lucide-react'
import '../styles/components/battery-bar.css'

interface BatteryBarProps {
    percentage: number
    status: string
    isConservationEnabled: boolean
}

export function BatteryBar({ percentage, status, isConservationEnabled }: BatteryBarProps) {
    let colorClass = 'var(--accent)'
    let Icon = Battery

    if (percentage <= 20 && status !== 'Charging') {
        colorClass = 'var(--danger)'
        Icon = BatteryWarning
    } else if (status === 'Charging') {
        Icon = BatteryCharging
    } else if (status === 'Full' || percentage >= 95) {
        colorClass = 'var(--success)'
        Icon = BatteryFull
    }

    return (
        <div className="battery-card">
            <div className="battery-header">
                <span className="battery-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon size={16} /> Battery
                </span>
                <div className="battery-status-badge">
                    {status}
                </div>
            </div>

            <div className="battery-level-row">
                <div className="battery-bar-container">
                    <div
                        className="battery-bar-fill"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: colorClass
                        }}
                    />
                </div>
                <span className="battery-percentage">{percentage}%</span>
            </div>

            <div className="battery-details">
                <div className="battery-status-group">
                    <span className="battery-label">Conservation Mode:</span>
                    <span className={`battery-value ${isConservationEnabled ? 'conservation-on' : ''}`}>
                        {isConservationEnabled ? 'On' : 'Off'}
                    </span>
                </div>
            </div>
        </div>
    )
}
