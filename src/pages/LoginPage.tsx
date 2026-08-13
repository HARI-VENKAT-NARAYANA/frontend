import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { roleHome, useAuth } from '../auth/AuthContext'
import { Button, Field, Spinner } from '../components/ui'

export default function LoginPage() {
  const { user, login, error: authError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (user) navigate(roleHome(user.role), { replace: true })
  }, [navigate, user])
  const from = (location.state as { from?: string } | null)?.from

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')
    if (!email || !password) { setFormError('Enter your email and password to continue.'); return }
    setIsSubmitting(true)
    try {
      await login(email, password, remember)
      navigate(from || '/', { replace: true })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally { setIsSubmitting(false) }
  }

  return <main className="login-page"><section className="login-brand-panel"><div className="login-brand-top"><div className="brand-mark brand-mark-large">N</div><div><strong>NEUZEN AI</strong><span>Human Resource Management System</span></div></div><div className="login-quote"><span className="eyebrow">People, in focus</span><blockquote>“The clearest path to better work is a better understanding of the people doing it.”</blockquote><p>One calm operating layer for every moment that matters across your employee experience.</p></div><div className="login-brand-foot"><ShieldCheck size={17} /><span>Secure workspace · Encrypted sessions · Role-aware access</span></div></section><section className="login-form-panel"><div className="login-form-wrap"><div className="login-form-header"><span className="eyebrow">Welcome back</span><h1>Sign in to your workspace.</h1><p>Access the NEUZEN AI people operations hub.</p></div><form onSubmit={submit} noValidate><Field label="Email address" required><div className="input-with-icon"><Mail size={16} /><input className="input" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div></Field><Field label="Password" required><div className="input-with-icon"><LockKeyhole size={16} /><input className="input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} /><button type="button" className="input-action" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></Field><div className="login-form-meta"><label className="checkbox-label"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><span>Remember me</span></label><button type="button" className="text-button">Forgot password?</button></div>{(formError || authError) && <div className="form-alert" role="alert">{formError || authError}</div>}<Button type="submit" size="lg" className="login-submit" disabled={isSubmitting}>{isSubmitting && <Spinner size={16} />}{isSubmitting ? 'Signing in…' : 'Sign in'}</Button></form><div className="login-demo-note"><span className="eyebrow">Demo access</span><p>Use a seeded administrator, HR, or employee account when the API is running.</p><code>admin@neuzenai.com</code></div></div></section></main>
}
