// Oficina SZ2 — vista "Clientes": proyectos → conversaciones → ramas, con estado en vivo.
// Clic en una conversación la abre en el Desktop. La oficina pixel queda como pestaña opcional.
import { ROUTES_AREA, SIDEBAR_NAV_AREA, PALETTE_AREA, SandboxedFrame, Button, host } from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'
import { useEffect, useRef, useState } from 'react'

const BASE = 'http://100.127.212.23:9000'

function OficinaPage() {
  const [tab, setTab] = useState('clientes')
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
  return jsxs('div', {
    style: { width: '100%', height: '100%', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' },
    children: [
      jsx('div', {
        style: { padding: '6px 12px', display: 'flex', gap: 6 },
        children: [['clientes', 'Clientes'], ['oficina', 'Oficina pixel']].map(([v, l]) => jsx(Button, {
          key: v, size: 'sm', variant: tab === v ? 'secondary' : 'ghost', onClick: () => setTab(v), children: l
        }))
      }),
      jsx(SandboxedFrame, {
        key: tab,
        ref,
        src: tab === 'clientes' ? BASE + '/clientes' : BASE + '/?v=3',
        title: tab === 'clientes' ? 'Clientes SZ2' : 'Oficina pixel',
        style: { flex: 1, width: '100%', minHeight: 'calc(100vh - 110px)', border: 0 }
      })
    ]
  })
}

export default {
  id: 'oficina-sz2',
  name: 'Oficina SZ2',
  register(ctx) {
    ctx.registerMany([
      { id: 'page', area: ROUTES_AREA, data: { path: '/oficina' }, render: () => jsx(OficinaPage, {}) },
      { id: 'nav', area: SIDEBAR_NAV_AREA, data: { path: '/oficina', label: 'Clientes', codicon: 'organization' } },
      { id: 'open', area: PALETTE_AREA, data: { id: 'oficina.open', label: 'Abrir Clientes (agentes en vivo)', keywords: ['clientes', 'oficina', 'agentes'], run: () => host.navigate('/oficina') } }
    ])
  }
}
