# Host Adapter Interface

The reader never talks to its host environment directly (no `chrome.*`, no `window.localStorage`, no host-specific network endpoints). Everything host-specific goes through a single object, `g.hostAdapter` (see [Globals.js](../Globals.js)), which each host project implements in its own `adapter/HostAdapter.js`.

Current hosts:

| Host | Adapter | Reader mounted at |
|------|---------|-------------------|
| RW Reader Chrome extension | `extension/adapter/HostAdapter.js` | `extension/reader/` |
| Reader's Web Publisher WordPress plugin | `adapter/HostAdapter.js` | `reader/` |

Adapters import from the reader with relative paths like `'../reader/Globals.js'`, so the reader must be mounted in a folder named `reader` next to the host's `adapter` folder.

## Bootstrapping

The host provides an ES-module entry point (by convention `adapter/startup.js`) that does three things:

```js
import g from '../reader/Globals.js'
import HostAdapter from './HostAdapter.js'
import '../reader/readerStartUp.js'

g.hostAdapter = new HostAdapter()
```

Nothing in the reader reads `g.hostAdapter` at module-evaluation time, so a plain top-level assignment is enough. The adapter's constructor calls its own `initReader()`. That method waits for the host's "go" signal (the extension uses a custom `initReader` window event dispatched by its content script; the plugin uses `DOMContentLoaded`) and then drives startup with the reader exports below.

### Reader exports used to drive startup

| Export | Module | Purpose |
|--------|--------|---------|
| `parseStaticContent(contentString, url, savedParsingRules?)` | `parsers/ParsingManager.js` | Detects the document type and parses it. Resolves `{dataObject, error}`; `dataObject.docType` is `'h'` (hdoc), `'c'` (cdoc) or `'condoc'`. |
| `getHdocJsonAndContentFromCurrentDocument()` / `parseHtmlPageWithEmbeddedHDoc(url, content, hdocDataJSON)` | `parsers/EmbHDOCParser.js` | Parse an embedded HDOC from the current page's own DOM (used by the plugin). |
| `loadUIAndIcons()` | `readerStartUp.js` | Binds the flinks canvas, loads icons, builds the UI and installs the keyboard handler. Requires the reader DOM to exist. |
| `applyAllSavedSettings()` | `readerStartUp.js` | Restores theme, font size, font set and favorites via `getSetting`. Call it after `loadUIAndIcons()` and before loading a document. |
| `addListenersToContainer(container)` | `readerStartUp.js` | Adds the horizontal scroll-snap behaviour (mobile two-pane layout) to the scrolling container. |
| `g.pdm.loadDocument(dataObject)` / `g.pdm.loadCollage(dataObject)` / `g.pdm.showEmptyCondoc(dataObject)` | `PopupDocumentManager.js` | Render the main document for each `docType`. |
| `dispatchReaderReady(url)` | `readerStartUp.js` | Fires the `swpReaderReady` `CustomEvent` on `document` (`detail: {url}`) once per page. |
| `setTheme(name, shouldSave)` | `helpers.js` | Absolute theme setter. |
| `setFontSet(id, shouldSave)` | `Fonts.js` | Absolute font-set setter. |

Settings changed in another tab or by the host's own UI can be applied by calling the absolute setters with `shouldSave` set to `false` (see [persisted-settings.md](persisted-settings.md)).

## Fields

| Field | Type | Meaning | Extension | Plugin |
|-------|------|---------|-----------|--------|
| `allowFontResizing` | boolean | Enables the Ctrl/Cmd `-` and `=` font-size shortcuts. | `true` | `false` |
| `allowDynamicThemeChange` | boolean | Enables Ctrl+`[`, which cycles through favorite theme/font combinations. | `true` | `false` |
| `mainDocumentTitleSpanId` | string | DOM id of the main document's title span. | `CurrentDocumentTitleSpan` | `CurrentDocumentTitleSpan-rwp` |
| `mainDocumentInfoButtonId` | string | DOM id of the main document's info button. If the element is missing, the reader assumes another reader (e.g. the extension) has taken over the page and sets `g.extensionTookControl`. | `CurrentDocumentInfoButton` | `CurrentDocumentInfoButton-rwp` |
| `currentDocumentCloseButtonId` | string | DOM id of the close button. If the element exists, clicking it calls `reloadPage()`. Use an id that doesn't exist to hide the feature. | `CurrentDocumentCloseButton` | (none) |
| `shouldBlockCrossOriginCommentsRequests` | boolean | When `true`, comments hosted on another domain aren't fetched. An "open in a new tab" link is shown instead, labelled with `getOpenCommentsInNewTabLabel()`. | `false` | `true` |
| `isPromotionalButtonSupported` | boolean | Shows the `#PromotionButton` (the "get the extension" promo) if it exists in the DOM. | `false` | `true` |

The plugin uses `-rwp` suffixes so its server-rendered DOM doesn't collide with the extension's reader when the extension takes over a plugin page.

## Methods

### `fetchWebPage(url, options) → Promise<{text, error}>`
Fetches a **cross-origin** page. Same-origin requests are fetched directly by [NetworkManager.js](../NetworkManager.js), which also caches responses and de-duplicates requests before calling the adapter. `error` is falsy on success. `options` may contain:
- `currentPageUrl`: the main document's URL (always added by NetworkManager).
- `isForCondoc`: the request loads a CONDOC's main (third-party) page.
- `isUserSpecifiedUrl`: the user typed or pasted the URL.

Extension: relays to the background service worker through a private `MessagePort`. Plugin: calls the `/sw-proxy/` endpoint with `source_url`/`target_url`.

### `getSetting(key) → Promise<any>` / `saveSetting(key, value)`
Persist a reader setting. Keys in use: `theme`, `fontSize`, `fontSet`, `favorites`. `getSetting` resolves `undefined`/`null` for unknown keys, and the reader then falls back to defaults. Extension: `chrome.storage.local` through `bridge.js`. Plugin: stubs (settings are site-wide and server-rendered).

### `getCurrentThemeName() → string | null`
The active theme name, used to pick connection colours. Extension: `g.currentTheme`. Plugin: read from the `theme-*` class on `#ui-root`.

### `getAssetsUrl() → string | null`
Base URL of the reader's `images/` folder. Return `null` to resolve images relative to the reader modules (`import.meta.url`). This works when the raw modules are served, but not from a bundle in another folder.

### `executeAfterOptionalDelay(func, delay = 500)`
Runs a deferred network action (CONDOC main page, comments). The extension calls `func()` immediately. The plugin waits `delay` ms and runs `func` only if its own reader is still on the page, i.e. the extension hasn't replaced it.

### `reloadPage()`
Leaves the reader and shows the original page. The extension asks its content script to reload; the plugin does nothing.

### `getOpenCommentsInNewTabLabel() → string`
Label for the "open in a new tab to view comments" link (see `shouldBlockCrossOriginCommentsRequests`).

## Globals a host may set

- `g.adminBarHeight`: vertical offset of the reader container (the WordPress admin bar).
- `g.favorites`: list of `{theme, fontSetId}` favorites. Normally restored by `applyAllSavedSettings()`, but a host may update it when favorites change elsewhere.
- `g.readingManager.flinkStyle`: `'thin'` or `'thick'`. Call `g.readingManager.redrawFlinks()` after changing it.

## Host responsibilities outside the adapter

- **DOM:** the reader expects a fixed DOM structure: `#ui-root`, `#AllDocumentsContainer`, `#flinks-canvas`, the left/right panel elements and the ids listed in the fields above. Extension: `extension/adapter/reader.html`. Plugin: `templates/reader-template.php`. Keep both in sync when the reader starts using a new element.
- **CSS:** load `reader.css`, `PageInfo.css`, `ExportPage.css`, `hdocStyles.css` and a theme from `themes/`. Host-specific overrides go in the host's `adapter/reader.css`.
- **Bundling:** hosts may bundle `adapter/startup.js` (the plugin uses esbuild). The reader is plain ES modules with no dependencies to install.
