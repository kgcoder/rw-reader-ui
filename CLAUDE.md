# RW Reader UI — CLAUDE.md

## Project Overview

The shared reader UI for the **Reader's Web**: it displays HDOC, CDOC and CONDOC documents (standalone and embedded) and the visible connections ("floating links" / "flinks" in the code) between them. It is consumed as a git submodule by two host projects:

- the **RW Reader** Chrome extension, mounted at `extension/reader/`
- the **Reader's Web Publisher** WordPress plugin, mounted at `reader/`

**Tech:** vanilla JS, ES modules, no build toolchain, no tests.

## Detailed docs

Read the relevant file before working in that area:

- [docs/host-adapter.md](docs/host-adapter.md): the `g.hostAdapter` interface and how hosts bootstrap the reader.
- [docs/architecture.md](docs/architecture.md): modules, global state (`g.*`), document subtype numbers.
- [docs/persisted-settings.md](docs/persisted-settings.md): required reading before adding any user-configurable setting.
- [docs/readers-web.md](docs/readers-web.md): the Reader's Web formats. Full specs: https://github.com/kgcoder/readers-web-specs

## Key Rules

- The code must stay **host-agnostic**: no `chrome.*`, no `window.localStorage`, no host-specific URLs or endpoints. Anything that differs per host goes through `g.hostAdapter`. If a new adapter member is needed, document it in [docs/host-adapter.md](docs/host-adapter.md) and implement it in **both** hosts' `adapter/HostAdapter.js`.
- If the reader starts relying on a new DOM element, both hosts' markup (the extension's `adapter/reader.html`, the plugin's `templates/reader-template.php`) must provide it.
- Do not use optional chaining or nullish coalescing (the plugin bundles for older browsers).
- Every first-party JS file starts with the license header used in [Globals.js](Globals.js). Third-party files (`dompurify/`, `hashing/`) keep their own headers.
- The folder layout is part of the contract: host adapters import with paths like `'../reader/Globals.js'`, so don't move or rename public modules without updating both hosts.
