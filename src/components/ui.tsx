import { AlertCircle, Check, CheckCircle2, LoaderCircle, X } from 'lucide-react'
import { createContext, useContext, useEffect, useMemo, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { Role } from '../types'

export function formatCurrency(value = 0) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(value?: string | Date, options?: Intl.DateTimeFormatOptions) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', options || { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export function formatTime(value?: string | Date) {
  if (!value) return '—'
  return formatDate(value, { hour: 'numeric', minute: '2-digit' })
}

export function formatStatus(value?: string) {
  return value ? value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()) : '—'
}

export function getInitials(name = '') {
  return name.split(' ').filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase() || 'N'
}

export function getUserName(value: any) {
  return typeof value?.user === 'object' ? value.user.name : typeof value === 'object' ? value.name : 'Unknown'
}

export function getEmployeeName(value: any) {
  if (typeof value?.user === 'object' && value.user?.name) return value.user.name
  if (typeof value === 'object' && value?.name) return value.name
  return 'Employee'
}

export function roleLabel(role?: Role) {
  return role === 'ADMIN' ? 'Administrator' : role === 'HR' ? 'People & Culture' : 'Team member'
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'text'; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  return <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>{children}</button>
}

export function IconButton({ label, className = '', children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; className?: string }) {
  return <button type="button" aria-label={label} title={label} className={`icon-button ${className}`} {...props}>{children}</button>
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <LoaderCircle className="spin" size={size} aria-label="Loading" />
}

export function Avatar({ name, size = 'md' }: { name?: string; size?: 'sm' | 'md' | 'lg' }) {
  return <span className={`avatar avatar-${size}`} aria-hidden="true">{getInitials(name)}</span>
}

export function StatusBadge({ status }: { status?: string }) {
  const tone = status?.toLowerCase().includes('reject') || status?.toLowerCase().includes('inactive') || status === 'ABSENT' ? 'danger' : status?.toLowerCase().includes('pending') || status?.toLowerCase().includes('late') || status === 'PROCESSING' ? 'warning' : status?.toLowerCase().includes('approved') || status?.toLowerCase().includes('active') || status?.toLowerCase().includes('paid') || status === 'PRESENT' || status === 'COMPLETED' ? 'success' : 'neutral'
  return <span className={`status status-${tone}`}><span className="status-dot" />{formatStatus(status)}</span>
}

export function Panel({ className = '', children }: { className?: string; children: ReactNode }) {
  return <section className={`panel ${className}`}>{children}</section>
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="page-header"><div><div className="eyebrow">{eyebrow || 'Workspace'}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />
}

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return <div className="skeleton-table" aria-label="Loading records">{Array.from({ length: rows }).map((_, row) => <div className="skeleton-row" key={row}>{Array.from({ length: columns }).map((__, column) => <Skeleton key={column} className={column === 0 ? 'skeleton-wide' : ''} />)}</div>)}</div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="empty-state"><div className="empty-mark">—</div><h3>{title}</h3><p>{description}</p>{action}</div>
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error-state"><AlertCircle size={18} /><div><strong>We couldn’t load this view.</strong><p>{message}</p>{retry && <Button variant="text" size="sm" onClick={retry}>Try again</Button>}</div></div>
}

type Toast = { id: number; title: string; message?: string; tone: 'success' | 'error' | 'info' }
const ToastContext = createContext<{ push: (toast: Omit<Toast, 'id'>) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random()
    setToasts((current) => [...current.slice(-2), { ...toast, id }])
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== id)), 4500)
  }
  const value = useMemo(() => ({ push }), [])
  return <ToastContext.Provider value={value}>{children}<div className="toast-stack" aria-live="polite">{toasts.map((toast) => <div className={`toast toast-${toast.tone}`} key={toast.id}><span className="toast-icon">{toast.tone === 'success' ? <CheckCircle2 size={16} /> : toast.tone === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}</span><div><strong>{toast.title}</strong>{toast.message && <p>{toast.message}</p>}</div><IconButton label="Dismiss" onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}><X size={14} /></IconButton></div>)}</div></ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}

export function Modal({ open, title, description, onClose, children, wide = false }: { open: boolean; title: string; description?: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', handleKey)
    document.body.classList.add('modal-open')
    return () => { document.removeEventListener('keydown', handleKey); document.body.classList.remove('modal-open') }
  }, [open, onClose])
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}><div className={`modal ${wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-header"><div><h2 id="modal-title">{title}</h2>{description && <p>{description}</p>}</div><IconButton label="Close" onClick={onClose}><X size={18} /></IconButton></div>{children}</div></div>
}

export function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onCancel, onConfirm, tone = 'danger', isLoading = false }: { open: boolean; title: string; description: string; confirmLabel?: string; onCancel: () => void; onConfirm: () => void; tone?: 'danger' | 'primary'; isLoading?: boolean }) {
  return <Modal open={open} title={title} description={description} onClose={onCancel}><div className="confirm-actions"><Button variant="secondary" onClick={onCancel} disabled={isLoading}>Cancel</Button><Button variant={tone} onClick={onConfirm} disabled={isLoading}>{isLoading && <Spinner size={15} />}{confirmLabel}</Button></div></Modal>
}

export function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return <label className="field"><span className="field-label">{label}{required && <em>*</em>}</span>{children}{hint && !error && <span className="field-hint">{hint}</span>}{error && <span className="field-error" role="alert">{error}</span>}</label>
}
