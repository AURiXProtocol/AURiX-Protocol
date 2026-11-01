# aurix-mods

Mods for Claude Code, made by AURiX.

## model-gate

model-gate guards the Agent tool, which is how Claude hands a job to a helper. Before a helper starts, the gate looks at which model the call asks for. A call that names `sonnet`, `haiku` or `opus` goes through. A call that names no model, names any other model, or asks for a fork is refused, with a plain message saying why. A fork is refused because it always runs on its parent's model, whatever model it names. The point is that helper work never quietly runs on the most expensive model. If the gate itself breaks, it refuses the call; it never waves one through by accident.

## Install

At the prompt of a terminal session, put the real GitHub repository in place of `AURiXProtocol/AURiX-Protocol`:

```
/plugin install model-gate --marketplace AURiXProtocol/AURiX-Protocol
```

Claude asks `Add marketplace?`. Answer `y`. Then it asks where to install it; the first choice, the user scope, is the usual one. Press Enter. When you see `Installed model-gate. Plugin is now active.`, the gate is running in that session, and in every session you start after it.

From a shell instead:

```
claude plugin install model-gate --marketplace AURiXProtocol/AURiX-Protocol
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, then Add marketplace with `AURiXProtocol/AURiX-Protocol`, then Add plugin.

## Check that it is on

Ask Claude to hand a small job to a helper.

- If the call names a model, the status line reads `model-gate: ok — <model>`, for example `model-gate: ok — sonnet`.
- If the call names no model, it is refused with the law's text (the rule the gate enforces), which begins `model-gate: spawn refused — no cheaper model named.`

## Turn it off

Uninstall it, from a shell:

```
claude plugin uninstall model-gate
```

Start a new session afterwards to be sure it is off.

## License

MIT. See `plugins/model-gate/LICENSE`.
