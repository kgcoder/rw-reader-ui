# RW Reader UI

The shared reader UI for the [Reader's Web](docs/readers-web.md). It displays HDOC, CDOC and CONDOC documents (standalone and embedded) and draws the visible connections between them.

It is used as a git submodule by:
- **RW Reader**, the Chrome extension ([Chrome Web Store](https://chromewebstore.google.com/detail/visible-connections/hlckcdbgknflkkciojgdbhomdnegimbm)), at `extension/reader/`
- **Reader's Web Publisher**, the WordPress plugin ([GitHub](https://github.com/kgcoder/static-web-publisher-plugin)), at `reader/`

The reader is host-agnostic: plain ES modules with no build step and no dependencies to install. Everything host-specific (network proxying, settings storage, startup, DOM ids) goes through a host adapter, `g.hostAdapter`, which each host implements.

## Documentation

- [docs/host-adapter.md](docs/host-adapter.md): the adapter interface a host must implement, and how to bootstrap the reader.
- [docs/architecture.md](docs/architecture.md): modules, global state, document subtypes.
- [docs/persisted-settings.md](docs/persisted-settings.md): how to add a persisted reader setting.
- [docs/readers-web.md](docs/readers-web.md): a short overview of the Reader's Web formats.

## Using it as a submodule

Add it to a host project. The folder must be named `reader`, next to the host's `adapter/` folder:

```sh
git submodule add https://github.com/kgcoder/rw-reader-ui reader
```

Clone a host project with the reader included:

```sh
git clone --recurse-submodules <host repo>
# or, in an existing clone:
git submodule update --init
```

Move a host to a newer reader version:

```sh
cd reader && git pull origin main && cd ..
git add reader && git commit -m "Update reader"
```

Make reader changes in this repo (or inside the submodule checkout, on a branch), push them here, and then update each host's pin.

When packaging a host for release (Chrome Web Store zip, WordPress.org SVN), leave out the submodule's `.git` file.

## License

Code: MIT, see [LICENSE](LICENSE). © 2025 Karen Grigorian.

The reader implements document types defined by the Reader's Web project. They are licensed under CC BY-ND 4.0 and maintained at https://github.com/kgcoder/readers-web-specs.

Third-party code keeps its own license: [DOMPurify](https://github.com/cure53/DOMPurify) (`dompurify/`, Apache-2.0 / MPL-2.0) and [sha256-es](https://github.com/logotype/es-crypto) (`hashing/sha256-es/`, MIT).
