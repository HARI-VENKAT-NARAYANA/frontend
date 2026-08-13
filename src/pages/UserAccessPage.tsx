import { ShieldCheck, UserCog } from 'lucide-react'
import { useEffect, useState } from 'react'
import api, { getApiError } from '../services/api'
import type { Paginated, Role, User } from '../types'
import { Avatar, Button, EmptyState, ErrorState, formatDate, PageHeader, Panel, Spinner, StatusBadge, TableSkeleton, useToast } from '../components/ui'

export default function UserAccessPage() {
  const [result, setResult] = useState<Paginated<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const { push } = useToast()
  const load = () => { setLoading(true); setError(''); api.get('/auth/users', { params: { page: 1, limit: 100 } }).then((response) => setResult(response.data.data)).catch((requestError) => setError(getApiError(requestError))).finally(() => setLoading(false)) }
  useEffect(() => { load() }, [])
  const updateRole = async (id: string, role: Role) => { setSaving(id); try { await api.put(`/auth/users/${id}/role`, { role }); push({ tone: 'success', title: 'Role updated', message: 'The next session will use the new access policy.' }); load() } catch (requestError) { push({ tone: 'error', title: 'Could not update role', message: getApiError(requestError) }) } finally { setSaving(null) } }
  if (loading) return <><PageHeader eyebrow="System access" title="User access" /><Panel><TableSkeleton rows={6} columns={4} /></Panel></>
  if (error) return <ErrorState message={error} retry={load} />
  return <><PageHeader eyebrow="System access" title="User access" description="Keep authentication and role permissions explicit across the organization." /><div className="access-summary"><Panel><ShieldCheck size={19} /><div><strong>RBAC is active</strong><p>Every API action is protected by server-side role middleware.</p></div></Panel><Panel><UserCog size={19} /><div><strong>{result?.total || 0} accounts</strong><p>Only administrators can change a user’s role.</p></div></Panel></div><Panel className="operation-table-panel">{result?.items.length ? <div className="data-table-wrap"><table className="data-table"><thead><tr><th>User</th><th>Role</th><th>Created</th><th className="numeric">Access level</th></tr></thead><tbody>{result.items.map((user) => <tr key={user.id}><td><div className="table-person"><Avatar name={user.name} size="sm" /><div className="table-person-copy"><strong>{user.name}</strong><span>{user.email}</span></div></div></td><td><StatusBadge status={user.role} /></td><td>{formatDate(user.createdAt)}</td><td><div className="role-control"><select className="select-field" value={user.role} disabled={saving === user.id} onChange={(event) => updateRole(user.id, event.target.value as Role)} aria-label={`Role for ${user.name}`}><option value="ADMIN">Administrator</option><option value="HR">People & Culture</option><option value="EMPLOYEE">Team member</option></select>{saving === user.id && <Spinner size={14} />}</div></td></tr>)}</tbody></table></div> : <EmptyState title="No accounts found" description="Seed the database to create the first workspace accounts." action={<Button onClick={load}>Refresh</Button>} />}</Panel></>
}
