// Oficina SZ2 — vista "Clientes": proyectos → conversaciones → ramas, con estado en vivo.
// Clic en una conversación la abre en el Desktop. La oficina pixel queda como pestaña opcional.
import { ROUTES_AREA, SIDEBAR_NAV_AREA, PALETTE_AREA, SandboxedFrame, host } from '@hermes/plugin-sdk'
import { jsx } from 'react/jsx-runtime'
import { useEffect, useRef } from 'react'

const BASE = 'http://100.127.212.23:9000'

function OficinaPage() {
  const ref = useRef(null)
  useEffect(() => {
    const onMsg = (e) => {
      const d = e.data
      if (!d || d.type !== 'sz2-open-session' || typeof d.id !== 'string') return
      if (!ref.current || e.source !== ref.current.contentWindow) return
      if (!/^[0-9A-Za-z_-]{6,80}$/.test(d.id)) return
      const profile = typeof d.profile === 'string' && d.profile !== 'default' ? d.profile : undefined
      try { host.openSession(d.id, profile ? { profile } : {}) } catch (err) { host.notify?.({ kind: 'error', message: 'No pude abrir la conversación' }) }
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])
  return jsx(SandboxedFrame, {
    ref,
    src: BASE + '/oficina',
    title: 'Oficina SZ2 — clientes y agentes en vivo',
    style: { width: '100%', height: '100%', minHeight: 'calc(100vh - 60px)', border: 0 }
  })
}

export default {
  id: 'oficina-sz2',
  name: 'Oficina SZ2',
  register(ctx) {
    ctx.registerMany([
      { id: 'page', area: ROUTES_AREA, data: { path: '/oficina' }, render: () => jsx(OficinaPage, {}) },
      { id: 'nav', area: SIDEBAR_NAV_AREA, data: { path: '/oficina', label: 'Oficina', codicon: 'organization' } },
      { id: 'open', area: PALETTE_AREA, data: { id: 'oficina.open', label: 'Abrir Oficina (clientes en vivo)', keywords: ['clientes', 'oficina', 'agentes'], run: () => host.navigate('/oficina') } }
    ])
  }
}
