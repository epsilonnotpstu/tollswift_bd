import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, onSnapshot } from 'firebase/firestore'
import { Toaster } from 'react-hot-toast'
import type { User } from 'firebase/auth'

import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { LoginPage } from './pages/LoginPage'
import { OverviewPage } from './pages/OverviewPage'
import { GatesPage } from './pages/GatesPage'
import { UsersPage } from './pages/UsersPage'
import { VehiclesPage } from './pages/VehiclesPage'
import { DisputesPage } from './pages/DisputesPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SettingsPage } from './pages/SettingsPage'
import { auth, db } from './services/firebase'

function AppShell({ user, pendingVehicles, openDisputes }: { user: User; pendingVehicles: number; openDisputes: number }) {
  const location = useLocation()

  const pageTitle = useMemo(() => {
    const mapping: Record<string, string> = {
      '/': 'Overview Dashboard',
      '/gates': 'Toll Gates Management',
      '/users': 'Users Management',
      '/vehicles': 'Vehicle Verification',
      '/disputes': 'Dispute Resolution',
      '/analytics': 'Advanced Analytics',
      '/settings': 'Settings',
    }
    return mapping[location.pathname] || 'TollBD Admin'
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        adminName={user.email || user.uid}
        pendingVehicles={pendingVehicles}
        openDisputes={openDisputes}
        onLogout={() => signOut(auth)}
      />
      <main className="flex-1 p-5">
        <TopBar title={pageTitle} />
        <Outlet />
      </main>
    </div>
  )
}

function AppRoutes() {
  const [user, setUser] = useState<User | null>(null)
  const [adminChecked, setAdminChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [pendingVehicles, setPendingVehicles] = useState(0)
  const [openDisputes, setOpenDisputes] = useState(0)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser)
      if (!authUser) {
        setIsAdmin(false)
        setAdminChecked(true)
        return
      }

      const tokenResult = await authUser.getIdTokenResult(true)
      const adminClaim = Boolean(tokenResult.claims.admin)
      setIsAdmin(adminClaim)
      setAdminChecked(true)

      if (!adminClaim) {
        await signOut(auth)
      }
    })

    return () => unsub()
  }, [])

  useEffect(() => {
    if (!isAdmin) return

    const unsubs: Array<() => void> = []

    unsubs.push(
      onSnapshot(collection(db, 'vehicles'), (snapshot) => {
        setPendingVehicles(
          snapshot.docs.filter((item) => item.data().brtc_status === 'pending_manual').length,
        )
      }),
    )

    unsubs.push(
      onSnapshot(collection(db, 'disputes'), (snapshot) => {
        setOpenDisputes(snapshot.docs.filter((item) => item.data().status !== 'resolved').length)
      }),
    )

    return () => unsubs.forEach((u) => u())
  }, [isAdmin])

  if (!adminChecked) {
    return <div className="flex min-h-screen items-center justify-center">Loading admin session...</div>
  }

  return (
    <Routes>
      <Route path="/login" element={user && isAdmin ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route
        element={
          user && isAdmin ? (
            <AppShell user={user} pendingVehicles={pendingVehicles} openDisputes={openDisputes} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/" element={<OverviewPage />} />
        <Route path="/gates" element={<GatesPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/disputes" element={<DisputesPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={user && isAdmin ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AppRoutes />
    </BrowserRouter>
  )
}
