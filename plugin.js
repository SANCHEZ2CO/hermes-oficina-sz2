// Oficina SZ2 — Hermes Pixel UI embebido en el navbar del Desktop.
import { ROUTES_AREA, SIDEBAR_NAV_AREA, PALETTE_AREA, SandboxedFrame, Button, host } from '@hermes/plugin-sdk'
import { jsx, jsxs } from 'react/jsx-runtime'

const URL = 'http://100.104.20.24:9000/'
let openExternal = () => {}

function OficinaPage() {
  return jsxs('div', {
    style: { width: '100%', height: '100%', minHeight: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' },
    children: [
      jsx('div', {
        style: { padding: '6px 12px' },
        children: jsx(Button, { size: 'sm', variant: 'ghost', onClick: () => openExternal(URL), children: 'Abrir en el navegador ↗' })
      }),
      jsx(SandboxedFrame, {
        src: URL + '?v=3',
        title: 'Oficina SZ2 — agentes en vivo',
        style: { flex: 1, width: '100%', minHeight: 'calc(100vh - 110px)', border: 0 }
      })
    ]
  })
}

export default {
  id: 'oficina-sz2',
  name: 'Oficina SZ2',
  register(ctx) {
    openExternal = (u) => ctx.os?.openExternal?.(u)
    ctx.registerMany([
      { id: 'page', area: ROUTES_AREA, data: { path: '/oficina' }, render: () => jsx(OficinaPage, {}) },
      { id: 'nav', area: SIDEBAR_NAV_AREA, data: { path: '/oficina', label: 'Oficina', codicon: 'organization' } },
      { id: 'open', area: PALETTE_AREA, data: { id: 'oficina.open', label: 'Abrir Oficina de agentes', keywords: ['oficina', 'pixel', 'agentes'], run: () => host.navigate('/oficina') } }
    ])
  }
}
