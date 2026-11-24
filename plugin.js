// Oficina SZ2 — pueblo estilo Pokémon: una casa por cliente, un escritorio por conversación.
// Mensajes del iframe:
//   {type:'sz2-action', action:'open',   id, profile}        → abre la conversación
//   {type:'sz2-action', action:'prompt', id, profile, text}  → abre la conversación y envía el texto al chat
//   (compat) {type:'sz2-open-session', id, profile}
import { ROUTES_AREA, SIDEBAR_NAV_AREA, PALETTE_AREA, SandboxedFrame, host } from '@hermes/plugin-sdk'
import { jsx } from 'react/jsx-runtime'
import { useEffect, useRef } from 'react'

const BASE = 'http://100.127.212.23:9000'
const ID_RE = /^[0-9A-Za-z_-]{6,80}$/
const TOKEN_KEY = 'sz2-oficina-token'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function reply(frame, ok, msg) {
  try { frame?.contentWindow?.postMessage({ type: 'sz2-result', ok, msg }, '*') } catch {}
}

async function openChat(id, profile, intent) {
  const opts = {}
  if (profile && profile !== 'default') opts.profile = profile
  if (intent) opts.intent = intent
  await host.openSession(id, opts)
}

async function sendToChat(id, profile, text) {
  // Abre la conversación en una pestaña nueva (la Oficina sigue abierta) y envía el texto a su caja de chat.
  await openChat(id, profile, 'tab')
  for (let i = 0; i < 20; i++) {
    await sleep(400)
    try { if (host.composer?.submit?.(id, text)) return true } catch {}
  }
  // Último recurso: dejarlo escrito en la caja de chat para que el usuario pulse Enviar.
  try { if (await host.composer?.setDraft?.(id, text)) { host.composer?.focus?.(id); return 'draft' } } catch {}
  return false
}

function OficinaPage() {
  const ref = useRef(null)
  useEffect(() => {
    const onMsg = async (e) => {
      const d = e.data
      if (!d || !ref.current || e.source !== ref.current.contentWindow) return
      const frame = ref.current
      // Acceso de la Oficina: el iframe aislado no puede guardar nada, así que lo recuerda el Desktop.
      if (d.type === 'sz2-token-get') {
        let token = ''
        try { token = window.localStorage.getItem(TOKEN_KEY) || '' } catch {}
        frame.contentWindow?.postMessage({ type: 'sz2-token', token }, '*')
        return
      }
      if (d.type === 'sz2-token-set') {
        try {
          const t = typeof d.token === 'string' ? d.token.slice(0, 300) : ''
          t ? window.localStorage.setItem(TOKEN_KEY, t) : window.localStorage.removeItem(TOKEN_KEY)
        } catch {}
        return
      }
      const id = typeof d.id === 'string' ? d.id : ''
      if (!ID_RE.test(id)) return
      const profile = typeof d.profile === 'string' ? d.profile : undefined
      try {
        if (d.type === 'sz2-open-session' || (d.type === 'sz2-action' && d.action === 'open')) {
          await openChat(id, profile)
          return
        }
        if (d.type === 'sz2-action' && d.action === 'prompt' && typeof d.text === 'string' && d.text.length < 2000) {
          const r = await sendToChat(id, profile, d.text)
          if (r === true) reply(frame, true, 'ENVIADO AL CHAT. LA RESPUESTA APARECE EN ESA CONVERSACION.')
          else if (r === 'draft') reply(frame, true, 'TE LO DEJE ESCRITO EN EL CHAT: SOLO PULSA ENVIAR.')
          else { reply(frame, false); host.notify?.({ kind: 'warning', message: 'No pude enviar al chat. Ábrelo y vuelve a intentarlo.' }) }
        }
      } catch (err) {
        reply(frame, false)
        host.notify?.({ kind: 'error', message: 'Oficina: no pude completar la acción' })
      }
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
      { id: 'open', area: PALETTE_AREA, data: { id: 'oficina.open', label: 'Abrir Oficina (clientes en vivo)', keywords: ['clientes', 'oficina', 'agentes', 'pueblo'], run: () => host.navigate('/oficina') } }
    ])
  }
}
