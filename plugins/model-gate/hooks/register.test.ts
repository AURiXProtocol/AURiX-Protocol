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
  on('tool.call', () => ({ result: { agentId: 'a1' } }))

  const refused = await $.tool.call(SPAWN)
  expect(refused.deny).toBe(NO_MODEL)

  const allowed = await $.tool.call({ ...SPAWN, model: 'sonnet' })
  expect(allowed.deny).toBe(undefined)
})

test('a fork and a fable spawn are denied whatever else they name', async ($, on) => {
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
