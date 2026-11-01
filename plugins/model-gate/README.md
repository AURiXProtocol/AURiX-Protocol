# model-gate

model-gate guards the Agent tool, which is how Claude hands a job to a helper. Before a helper starts, the gate checks which model the call names. A call naming `sonnet`, `haiku` or `opus` goes through. A call naming no model, any other model, or a fork is refused with a plain message saying why, so helper work never quietly runs on the most expensive model. If the gate itself breaks, it refuses the call rather than letting it through.

## Install

At the prompt of a terminal session, put the real GitHub repository in place of `AURiXProtocol/AURiX-Protocol`:

```
/plugin install model-gate --marketplace AURiXProtocol/AURiX-Protocol
```

Answer `y` to `Add marketplace?`, then press Enter on the first scope (user). The full steps are in the README at the root of the repository.

## Check that it is on

After Claude hands a job to a helper that names a model, the status line reads `model-gate: ok — <model>`. A helper call that names no model is refused with the law's text, which begins `model-gate: spawn refused — no cheaper model named.`

## Turn it off

Uninstall it: `claude plugin uninstall model-gate`.

MIT licensed. See `LICENSE`.
