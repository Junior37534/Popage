
import './GaugeChart.css'

interface GaugeChartProps {
    label: string
    value: number
    unit: string
    percentage: number
    subLable1?: string
    subValue1?: string
    subLable2?: string
    subValue2?: string
}

export function GaugeChart({
    label,
    value,
    unit,
    percentage,
    subLable1,
    subValue1,
    subLable2,
    subValue2
}: GaugeChartProps) {
    // SVG Arc Calculations
    const radius = 60
    const strokeWidth = 10
    const normalizedRadius = radius - strokeWidth / 2
    const circumference = normalizedRadius * 2 * Math.PI

    const arcLength = circumference * 0.75
    const fillLength = (percentage / 100) * arcLength
    const dashArray = `${arcLength} ${circumference}`
    const strokeDashoffset = arcLength - fillLength

    let colorClass = 'gauge-normal'
    if (percentage >= 85) colorClass = 'gauge-danger'
    else if (percentage >= 65) colorClass = 'gauge-warning'

    return (
        <div className="gauge-container">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="gauge-svg"
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            >
                <defs>
                    <linearGradient id="grad-danger" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f87171" />
                        <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                    <linearGradient id="grad-warning" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="grad-normal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--accent)" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>

                {/* Background Arc */}
                <circle
                    className="gauge-track"
                    stroke="var(--gauge-bg)"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeDashoffset={0}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />

                {/* Foreground Arc */}
                <circle
                    className={`gauge-fill ${colorClass}`}
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>

            <div className="gauge-center-content">
                <span className="gauge-value">{value}{unit}</span>
                <span className="gauge-label">{label}</span>
            </div>

            <div className="gauge-sub-metrics">
                {subLable1 && (
                    <div className="gauge-sub-metric">
                        <span className="sub-val">{subValue1}</span>
                        <span className="sub-lbl">{subLable1}</span>
                    </div>
                )}
                {subLable2 && (
                    <div className="gauge-sub-metric">
                        <span className="sub-val">{subValue2}</span>
                        <span className="sub-lbl">{subLable2}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
