import type { Register } from 'claude-code'

// The law (HOW_TO_SIT_HERE.md): the expensive seat reads and reasons only.
// Every sub-agent it spawns names a cheaper model: opus for building, sonnet
// or haiku for legwork. A spawn that names none runs on the expensive seat,
// and that is a breach. 'fable' is the expensive seat, so naming it is no
// answer either.
const CHEAP = ['sonnet', 'haiku', 'opus'] as const

const isCheap = (model: string | undefined): model is (typeof CHEAP)[number] =>
  CHEAP.some(cheap => cheap === model)

const NO_MODEL =
  "model-gate: spawn refused — no cheaper model named. The law (HOW_TO_SIT_HERE.md): Fable reads and reasons; every spawn names opus (building) or sonnet/haiku (legwork). Add model: 'sonnet' | 'haiku' | 'opus' and call again."

const FORK =
  "model-gate: spawn refused — a fork runs on the parent's model, the expensive seat, whatever model it names. The law (HOW_TO_SIT_HERE.md): Fable reads and reasons; every spawn names opus (building) or sonnet/haiku (legwork). Use a subagent_type that is not 'fork', add model: 'sonnet' | 'haiku' | 'opus' and call again."


// The seat's own model (Aaron, 2026-11-01): a thread opened on Fable burned 10%
// of his week reading its boot files before anyone noticed. On the main loop,
// while the model is Fable or Mythos, every tool call is refused -- reads too --
// so the seat can only say one line: switch to Opus. "stay on fable" in his own
// prompt lifts it for this session.
const DEAR = /fable|mythos/i
const SWITCH =
  "model-gate: this thread is on Fable, the expensive tier, so every tool call is refused (reads included). Tell Aaron in one line: switch to Opus in the model menu at the top of the chat, then send any message. Do nothing else. If he writes 'stay on fable', the gate lifts."
let stayOnFable = false

export const register: Register = (on, options) => {
  on('prompt.submit', ($, e, next) => {
    if (/stay on fable/i.test(String((e as { text?: unknown }).text ?? ''))) stayOnFable = true
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    if (e.agentId || stayOnFable) return next(e)
    const model = await $.session.model()
    if (DEAR.test(model)) {
      $.ui.status('model-gate: on Fable -- switch to Opus')
      $.ui.toast('This thread is on Fable. Switch to Opus in the model menu.')
      return { deny: SWITCH }
    }
    return next(e)
  }).catch(($, e, next) => (next.called ? next(e) : next(e)))

  on('tool.call', { tool: 'Agent' }, async ($, e, next) => {
    // A fork inherits the parent's model, so no model it names can save it.
    if (e.subagent_type === 'fork') {
      $.ui.status('model-gate: refused — a fork')
      $.ui.toast('model-gate refused a fork (it runs on the expensive seat)')
      return { deny: FORK }
    }

    const model = e.model
    if (!isCheap(model)) {
      $.ui.status('model-gate: refused — no cheaper model named')
      $.ui.toast('model-gate refused a spawn with no cheap model')
      return { deny: NO_MODEL }
    }

    $.ui.status(`model-gate: ok — ${model}`)
    return next(e)
  }).catch(($, e, next) =>
    // A guard that fails is skipped and the tool would run: refuse instead.
    next.called
      ? next(e)
      : { deny: 'model-gate: its guard failed, so the spawn is refused.' },
  )
}
