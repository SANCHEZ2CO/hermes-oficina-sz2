// Oficina SZ2 — Hermes Pixel UI embebido en el navbar del Desktop.
import { ROUTES_AREA, SIDEBAR_NAV_AREA, PALETTE_AREA, SandboxedFrame, host } from '@hermes/plugin-sdk'
import { jsx } from 'react/jsx-runtime'

const URL = 'http://100.104.20.24:9000/'

function OficinaPage() {
  return jsx('div', {
    style: { display: 'flex', flexDirection: 'column', height: '100%', width: '100%' },
    children: jsx(SandboxedFrame, {
      src: URL,
      title: 'Oficina SZ2 — agentes en vivo',
      style: { flex: 1, width: '100%', height: '100%', border: 0 }
    })
  })
}

export default {
  id: 'oficina-sz2',
  name: 'Oficina SZ2',
  register(ctx) {
    ctx.registerMany([
      { id: 'page', area: ROUTES_AREA, data: { path: '/oficina' }, render: () => jsx(OficinaPage, {}) },
      { id: 'nav', area: SIDEBAR_NAV_AREA, data: { path: '/oficina', label: 'Oficina', codicon: 'organization' } },
      { id: 'open', area: PALETTE_AREA, data: { id: 'oficina.open', label: 'Abrir Oficina de agentes', keywords: ['oficina', 'pixel', 'agentes'], run: () => host.navigate('/oficina') } }
    ])
  }
}
