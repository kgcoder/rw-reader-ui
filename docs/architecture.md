# Reader Architecture

Vanilla JS, ES modules, no build step, no dependencies to install. All paths are relative to the repo root (mounted as `reader/` in host projects).

- **Entry:** [readerStartUp.js](../readerStartUp.js) holds the startup helpers that host adapters call (see [host-adapter.md](host-adapter.md)).
- **Core managers:** `PopupDocumentManager.js` (main UI, documents, panels, comments), `ReadingManager.js` (connections, right-side documents, drawing flinks), `NoteDivsMethods.js`, `CollageViewer.js`, `CollageDataLoader.js`, `PageInfoManager.js`, `ExportPageManager.js`.
- **Parsers:** `parsers/HDOCParser.js`, `parsers/EmbHDOCParser.js`, `parsers/CDOCParser.js`, `parsers/CondocParser.js`, `parsers/HtmlPageParser.js`, `parsers/PlainTextParser.js`, `parsers/ParsingManager.js` (type detection and dispatch).
- **Models:** `models/FloatingLink.js`, `models/FLEnd.js`, `models/FLTextEnd.js`, `models/FLPointEnd.js`, `models/Line.js`, `models/Crosshair.js`, `models/ImageView.js`, `models/Viewport.js`.
- **Utilities:** `helpers.js`, `constants.js`, `Globals.js`, `NetworkManager.js`, `KeyboardManager.js`, `HeaderMethods.js`, `MultipleLinksPopupManager.js`, `Icons.js`, `Fonts.js`.
- **Text anchors:** `textAnchors.js` holds the text, hashing and sanitizing helpers behind text flink ends, and the anchoring checks (`isTextEndIntact`, `getIndicesForLinkInText`). It must not import `Globals.js` (directly or through `helpers.js`), so code outside the reader can use it without loading the reader; `helpers.js` re-exports its helpers. `models/FLTextEnd.js` follows the same rule.
- **Styles:** `reader.css`, `ExportPage.css`, `PageInfo.css`, `hdocStyles.css`, `themes/*.css` (light, dark, sepia, and more).
- **Images:** `images/` (icons served through `Icons.js`, see `getAssetsUrl()` in [host-adapter.md](host-adapter.md)).
- **Third-party:** `dompurify/purify.es.mjs` (HTML sanitizer, Apache-2.0 / MPL-2.0) and `hashing/sha256-es/` (SHA-256 for floating-link hashing, MIT).

## Global state

[Globals.js](../Globals.js) exports a shared object, imported as `g`:
- `g.pdm`: PopupDocumentManager
- `g.readingManager`: ReadingManager
- `g.noteDivsManager`: NoteDivsManager
- `g.hostAdapter`: set by the host (see [host-adapter.md](host-adapter.md))
- `g.currentTheme`, `g.currentFontSet`, `g.favorites`, `g.adminBarHeight`, and canvas and viewport state.

## Document subtypes

`0` = local hdoc, `1` = standalone hdoc, `2` = embedded hdoc, `3` = generated hdoc (parsing rules), `4` = generated hdoc (Readability), `5` = cdoc, `6` = sdoc (not yet), `7` = condoc, `8` = embedded cdoc, `9` = embedded condoc.
