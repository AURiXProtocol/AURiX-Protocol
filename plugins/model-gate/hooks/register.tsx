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

export const register: Register = (on, options) => {
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
