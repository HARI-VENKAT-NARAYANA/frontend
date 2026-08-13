import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { roleHome, useAuth } from './auth/AuthContext'
import { AppShell } from './components/AppShell'
import { Spinner } from './components/ui'
import CalendarPage from './pages/CalendarPage'
import DashboardPage from './pages/DashboardPage'
import EmployeesPage from './pages/EmployeesPage'
import LoginPage from './pages/LoginPage'
import OperationsPage from './pages/OperationsPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import UserAccessPage from './pages/UserAccessPage'
import type { Role } from './types'

function AuthGate({ roles }: { roles?: Role[] }) {
  const { user, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <div className="route-loading"><Spinner size={22} /><span>Preparing your workspace…</span></div>
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome(user.role)} replace />
  return <AppShell><Outlet /></AppShell>
}

function RootRedirect() {
  const { user, isLoading } = useAuth()
  if (isLoading) return <div className="route-loading"><Spinner size={22} /><span>Preparing your workspace…</span></div>
  return <Navigate to={user ? roleHome(user.role) : '/login'} replace />
}

function NotFound() {
  return <div className="route-loading"><h1>Page not found</h1><p>The workspace route you requested doesn’t exist.</p><a className="btn btn-primary" href="/">Return home</a></div>
}

export default function App() {
  return <BrowserRouter><Routes><Route path="/login" element={<LoginPage />} /><Route path="/" element={<RootRedirect />} /><Route element={<AuthGate roles={['ADMIN']} />}><Route path="/admin/dashboard" element={<DashboardPage />} /><Route path="/admin/employees" element={<EmployeesPage />} /><Route path="/admin/users" element={<UserAccessPage />} /><Route path="/admin/attendance" element={<OperationsPage kind="attendance" />} /><Route path="/admin/leaves" element={<OperationsPage kind="leaves" />} /><Route path="/admin/payroll" element={<OperationsPage kind="payroll" />} /><Route path="/admin/onboarding" element={<OperationsPage kind="onboarding" />} /><Route path="/admin/offer-letters" element={<OperationsPage kind="offers" />} /><Route path="/admin/calendar" element={<CalendarPage />} /><Route path="/admin/settings" element={<SettingsPage />} /></Route><Route element={<AuthGate roles={['HR']} />}><Route path="/hr/dashboard" element={<DashboardPage />} /><Route path="/hr/employees" element={<EmployeesPage />} /><Route path="/hr/attendance" element={<OperationsPage kind="attendance" />} /><Route path="/hr/leaves" element={<OperationsPage kind="leaves" />} /><Route path="/hr/payroll" element={<OperationsPage kind="payroll" />} /><Route path="/hr/onboarding" element={<OperationsPage kind="onboarding" />} /><Route path="/hr/offer-letters" element={<OperationsPage kind="offers" />} /><Route path="/hr/calendar" element={<CalendarPage />} /></Route><Route element={<AuthGate roles={['EMPLOYEE']} />}><Route path="/employee/dashboard" element={<DashboardPage />} /><Route path="/employee/attendance" element={<OperationsPage kind="attendance" />} /><Route path="/employee/leaves" element={<OperationsPage kind="leaves" />} /><Route path="/employee/payroll" element={<OperationsPage kind="payroll" />} /><Route path="/employee/profile" element={<ProfilePage />} /><Route path="/employee/calendar" element={<CalendarPage />} /></Route><Route path="*" element={<NotFound />} /></Routes></BrowserRouter>
}
