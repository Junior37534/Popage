
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Activity, Sliders, Settings, Monitor } from 'lucide-react'

import { Dashboard } from './pages/Dashboard'
import { Controls } from './pages/Controls'
import { SettingsPage } from './pages/Settings'

function Sidebar() {
    const location = useLocation()
    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <Monitor size={24} color="var(--accent)" />
            </div>
            <nav className="sidebar-nav">
                <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`} title="Dashboard">
                    <Activity size={20} />
                </Link>
                <Link to="/controls" className={`nav-item ${location.pathname === '/controls' ? 'active' : ''}`} title="Controls">
                    <Sliders size={20} />
                </Link>
                <Link to="/settings" className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} title="Settings">
                    <Settings size={20} />
                </Link>
            </nav>
        </aside>
    )
}

function SidebarWrapper() {
    return <Sidebar />
}

function App() {
    return (
        <HashRouter>
            <div className="app-layout">
                <SidebarWrapper />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/controls" element={<Controls />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    )
}

export default App
