
import { Cpu } from 'lucide-react'
import type { GpuProcess } from '../../shared/ipc-channels'

interface ProcessListProps {
    title: string
    processes: GpuProcess[]
}

export function ProcessList({ title, processes }: ProcessListProps) {
    const sortedProcesses = [...processes].sort((a, b) => b.memoryMiB - a.memoryMiB)

    return (
        <div style={styles.card}>
            <h3 style={styles.title}>
                <Cpu size={14} style={{ marginRight: 6, verticalAlign: 'middle', color: 'var(--accent)' }} />
                {title}
                {sortedProcesses.length > 0 && (
                    <span style={styles.badge}>{sortedProcesses.length}</span>
                )}
            </h3>
            <div style={styles.list} className="process-scroll">
                {sortedProcesses.length === 0 ? (
                    <div style={styles.empty}>No active processes</div>
                ) : (
                    sortedProcesses.map(proc => (
                        <div key={proc.pid} style={styles.processItem}>
                            <div style={styles.procInfo}>
                                <span style={styles.procName} title={proc.name}>
                                    {proc.name.split('/').pop() || proc.name}
                                </span>
                                <span style={styles.procPid}>PID: {proc.pid}</span>
                            </div>
                            <span style={styles.procMem}>{proc.memoryMiB} MiB</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

const styles = {
    card: {
        backgroundColor: 'var(--bg-secondary)',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        flex: 1,
        minWidth: '250px'
    },
    title: {
        fontSize: '14px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center'
    },
    badge: {
        marginLeft: '8px',
        backgroundColor: 'var(--accent)',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 700,
        padding: '2px 8px',
        borderRadius: '12px',
        lineHeight: '16px'
    },
    list: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '8px',
        maxHeight: '220px',
        overflowY: 'auto' as const,
        paddingRight: '4px'
    },
    processItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 12px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '8px'
    },
    procInfo: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2px',
        overflow: 'hidden'
    },
    procName: {
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap' as const,
        textOverflow: 'ellipsis',
        overflow: 'hidden'
    },
    procPid: {
        fontSize: '11px',
        color: 'var(--text-secondary)'
    },
    procMem: {
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--accent)'
    },
    empty: {
        fontSize: '13px',
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        padding: '8px 0'
    }
}
