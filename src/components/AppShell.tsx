import { Bell, CalendarDays, ChevronDown, ClipboardCheck, FileText, LayoutDashboard, LogOut, Menu, PanelLeftClose, Search, Settings, UserRound, UsersRound, WalletCards, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import api from '../services/api'
import { Avatar, IconButton, roleLabel, formatTime } from './ui'
import type { Role } from '../types'

type NavItem = { label: string; path: string; icon: typeof LayoutDashboard; roles: Role[] }
type NotificationRecord = { _id: string; title: string; message: string; category: string; readAt?: string; createdAt: string }

const navItems: NavItem[] = [
  { label: 'Overview', path: 'dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { label: 'Employees', path: 'employees', icon: UsersRound, roles: ['ADMIN', 'HR'] },
  { label: 'User access', path: 'users', icon: UserRound, roles: ['ADMIN'] },
  { label: 'Attendance', path: 'attendance', icon: ClipboardCheck, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { label: 'Leave', path: 'leaves', icon: CalendarDays, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { label: 'Payroll', path: 'payroll', icon: WalletCards, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { label: 'Onboarding', path: 'onboarding', icon: UsersRound, roles: ['ADMIN', 'HR'] },
  { label: 'Offer letters', path: 'offer-letters', icon: FileText, roles: ['ADMIN', 'HR'] },
  { label: 'Calendar', path: 'calendar', icon: CalendarDays, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { label: 'Settings', path: 'settings', icon: Settings, roles: ['ADMIN'] },
  { label: 'My profile', path: 'profile', icon: UserRound, roles: ['EMPLOYEE'] },
]

function getRoot(role: Role) {
  return role === 'ADMIN' ? '/admin' : role === 'HR' ? '/hr' : '/employee'
}

function Sidebar({ open, onClose, collapsed, onCollapse }: { open: boolean; onClose: () => void; collapsed: boolean; onCollapse: () => void }) {
  const { user } = useAuth()
  if (!user) return null
  const root = getRoot(user.role)
  return <aside className={`app-rail ${open ? 'rail-open' : ''} ${collapsed ? 'rail-collapsed' : ''}`}><div className="rail-brand"><div className="brand-mark">N</div><div className="brand-copy"><strong>NEUZEN</strong><span>AI / HRMS</span></div><IconButton label="Close navigation" className="rail-close" onClick={onClose}><X size={18} /></IconButton></div><nav className="rail-nav" aria-label="Main navigation">{navItems.filter((item) => item.roles.includes(user.role)).map((item) => { const Icon = item.icon; return <NavLink key={item.path} to={`${root}/${item.path}`} end={item.path === 'dashboard'} onClick={onClose} className={({ isActive }) => `rail-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.8} /><span>{item.label}</span></NavLink> })}</nav><div className="rail-footer"><div className="rail-footer-line" /><button type="button" className="collapse-control" onClick={onCollapse}><PanelLeftClose size={17} /><span>{collapsed ? 'Expand rail' : 'Collapse rail'}</span></button><div className="rail-version">NEUZEN AI <span>·</span> v1.0</div></div></aside>
}

function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const unread = items.filter((item) => !item.readAt).length
  const load = () => { setLoading(true); api.get('/notifications').then((response) => setItems(response.data.data)).catch(() => setItems([])).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])
  const markAll = async () => { await api.put('/notifications/read-all').catch(() => undefined); setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt || new Date().toISOString() }))) }
  const markRead = async (item: NotificationRecord) => { if (item.readAt) return; await api.put(`/notifications/${item._id}/read`).catch(() => undefined); setItems((current) => current.map((record) => record._id === item._id ? { ...record, readAt: new Date().toISOString() } : record)) }
  return <div className="popover-wrap"><IconButton label="Notifications" className="header-icon" onClick={() => { setOpen((value) => !value); if (!open) load() }}><Bell size={18} />{unread > 0 && <span className="notification-dot" />}</IconButton>{open && <div className="popover notification-popover"><div className="popover-title"><div><span className="eyebrow">Inbox</span><strong>Notifications</strong></div>{unread > 0 && <button type="button" className="text-button" onClick={markAll}>Mark all read</button>}</div>{loading ? <div className="notification-loading">Loading notifications…</div> : items.length ? items.slice(0, 5).map((item) => <button type="button" className={`notification-item ${!item.readAt ? 'unread' : ''}`} key={item._id} onClick={() => markRead(item)}><span className="notification-marker" /><span><strong>{item.title}</strong><p>{item.message}</p><time>{formatTime(item.createdAt)} · {item.category}</time></span></button>) : <div className="notification-loading">You’re all caught up.</div>}<div className="popover-footer"><span className="muted-copy">{unread} unread</span></div></div>}</div>
}

function ProfileMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  if (!user) return null
  return <div className="popover-wrap"><button type="button" className="profile-trigger" onClick={() => setOpen((value) => !value)}><Avatar name={user.name} size="sm" /><span className="profile-trigger-copy"><strong>{user.name}</strong><small>{roleLabel(user.role)}</small></span><ChevronDown size={15} /></button>{open && <div className="popover profile-popover"><div className="profile-popover-head"><Avatar name={user.name} /><div><strong>{user.name}</strong><span>{user.email}</span></div></div><button type="button" className="menu-item" onClick={() => { setOpen(false); navigate(user.role === 'EMPLOYEE' ? '/employee/profile' : user.role === 'ADMIN' ? '/admin/settings' : '/hr/dashboard') }}><UserRound size={16} /> {user.role === 'EMPLOYEE' ? 'My profile' : 'Workspace settings'}</button><button type="button" className="menu-item danger-text" onClick={logout}><LogOut size={16} /> Sign out</button></div>}</div>
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const title = segments[segments.length - 1]?.replaceAll('-', ' ') || 'dashboard'
  return <header className="topbar"><div className="topbar-left"><IconButton label="Open navigation" className="mobile-menu" onClick={onMenu}><Menu size={20} /></IconButton><div className="breadcrumbs"><span>NEUZEN AI</span><b>/</b><strong>{title.replace(/\b\w/g, (letter) => letter.toUpperCase())}</strong></div></div><div className="topbar-right"><label className="global-search"><Search size={16} /><input aria-label="Search workspace" placeholder="Search workspace" /><kbd>⌘ K</kbd></label><NotificationMenu /><ProfileMenu /></div></header>
}

export function AppShell({ children }: { children?: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  return <div className={`app-layout ${collapsed ? 'shell-collapsed' : ''}`}><Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} collapsed={collapsed} onCollapse={() => setCollapsed((value) => !value)} /><div className="app-main"><Topbar onMenu={() => setMobileOpen(true)} /><main className="app-content">{children || <Outlet />}</main></div>{mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}</div>
}
