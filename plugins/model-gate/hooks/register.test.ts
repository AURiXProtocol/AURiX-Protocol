import { expect, test } from 'claude-code/testing'

const NO_MODEL =
  "model-gate: spawn refused — no cheaper model named. The law (HOW_TO_SIT_HERE.md): Fable reads and reasons; every spawn names opus (building) or sonnet/haiku (legwork). Add model: 'sonnet' | 'haiku' | 'opus' and call again."

const SPAWN = {
  tool: 'Agent',
  description: 'legwork',
  prompt: 'read a file',
} as const

test('a spawn with no model is denied; one naming sonnet passes', async ($, on) => {
  // Nothing sits beneath the plugin: this hook stands for the engine.
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('tool.call', () => ({ result: { agentId: 'a1' } }))

  const refused = await $.tool.call(SPAWN)
  expect(refused.deny).toBe(NO_MODEL)

  const allowed = await $.tool.call({ ...SPAWN, model: 'sonnet' })
  expect(allowed.deny).toBe(undefined)
})

test('a fork and a fable spawn are denied whatever else they name', async ($, on) => {
  on('session.model', () => ({ value: 'claude-opus-5-5' }))
  on('tool.call', () => ({ result: { agentId: 'a1' } }))

  const fork = await $.tool.call({
    ...SPAWN,
    subagent_type: 'fork',
    model: 'sonnet',
  })
  expect(fork.deny?.startsWith('model-gate: spawn refused')).toBe(true)

  const fable = await $.tool.call({ ...SPAWN, model: 'fable' })
  expect(fable.deny).toBe(NO_MODEL)
})

test('on Fable every main-loop tool call is refused; on Opus it passes', async ($, on) => {
  let model = 'claude-fable-5-1'
  on('session.model', () => ({ value: model }))
  on('tool.call', () => ({ result: { ok: true } }))

  const blocked = await $.tool.call({ tool: 'Read', file_path: '/tmp/x' } as never)
  expect(blocked.deny?.startsWith('model-gate: this thread is on Fable')).toBe(true)

  model = 'claude-opus-5-5'
  const passed = await $.tool.call({ tool: 'Read', file_path: '/tmp/x' } as never)
  expect(passed.deny).toBe(undefined)
})
