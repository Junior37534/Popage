import { useState, useEffect } from 'react'
import { Palette, Activity, Info } from 'lucide-react'
import '../styles/components/settings.css'

const ACCENT_COLORS = [
    { name: 'Blue', value: '#6b8afd' },
    { name: 'Purple', value: '#a78bfa' },
    { name: 'Teal', value: '#2dd4bf' },
    { name: 'Green', value: '#4ade80' },
    { name: 'Orange', value: '#fb923c' },
    { name: 'Rose', value: '#fb7185' },
    { name: 'Cyan', value: '#22d3ee' },
    { name: 'Amber', value: '#fbbf24' },
]

const REFRESH_OPTIONS = [
    { label: '1 second', value: 1000 },
    { label: '2 seconds', value: 2000 },
    { label: '5 seconds', value: 5000 },
    { label: '10 seconds', value: 10000 },
]

export function SettingsPage() {
    const [accentColor, setAccentColor] = useState('#6b8afd')
    const [refreshRate, setRefreshRate] = useState(2000)

    useEffect(() => {
        const savedColor = localStorage.getItem('popage-accent')
        if (savedColor) setAccentColor(savedColor)

        const savedRate = localStorage.getItem('popage-refresh')
        if (savedRate) setRefreshRate(parseInt(savedRate, 10))
    }, [])

    const handleUpdateColor = (color: string) => {
        setAccentColor(color)
        document.documentElement.style.setProperty('--accent', color)
        localStorage.setItem('popage-accent', color)
        // Also fire off a custom event so hook updates if necessary
        window.dispatchEvent(new Event('popage-settings-updated'))
    }

    const handleUpdateRefresh = (rate: number) => {
        setRefreshRate(rate)
        localStorage.setItem('popage-refresh', rate.toString())
        window.dispatchEvent(new Event('popage-settings-updated'))
    }

    return (
        <div className="page-container">
            <h1 className="page-header">Settings</h1>

            <div className="settings-grid">
                {/* Appearance */}
                <div className="card">
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Palette size={16} /> Appearance
                    </div>
                    <div style={{ marginBottom: 8, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        Accent Color
                    </div>
                    <div className="color-picker">
                        {ACCENT_COLORS.map(({ name, value }) => (
                            <div
                                key={value}
                                className={`color-swatch ${accentColor === value ? 'active' : ''}`}
                                style={{ backgroundColor: value }}
                                title={name}
                                onClick={() => handleUpdateColor(value)}
                            />
                        ))}
                    </div>
                </div>

                {/* Monitoring */}
                <div className="card">
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Activity size={16} /> Monitoring
                    </div>
                    <div style={{ marginBottom: 8, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                        Refresh Rate
                    </div>
                    <div className="select-wrapper">
                        <select
                            className="select-input"
                            value={refreshRate}
                            onChange={(e) => handleUpdateRefresh(parseInt(e.target.value))}
                        >
                            {REFRESH_OPTIONS.map(({ label, value }) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <span className="select-arrow">▼</span>
                    </div>
                </div>

                {/* About */}
                <div className="card">
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Info size={16} /> About
                    </div>
                    <div className="about-info">
                        <div className="about-row">
                            <span className="about-label">Creator</span>
                            <span className="about-value">Junior37534</span>
                        </div>
                        <div className="about-row">
                            <span className="about-label">Version</span>
                            <span className="about-value">1.2.0</span>
                        </div>
                        <div className="about-row">
                            <span className="about-label">Stack</span>
                            <span className="about-value">Electron + React + TypeScript</span>
                        </div>
                        <div className="about-row">
                            <span className="about-label">Platform</span>
                            <span className="about-value">Pop!_OS / Linux</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
