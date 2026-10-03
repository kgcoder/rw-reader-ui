# The Reader's Web

The Reader's Web is a part of the browsable web where the reader, not the publisher, decides what web pages look like. Like RSS, the site owner provides only the content and the reader's software decides how to display it. Unlike RSS, it is based on standalone documents that open in browser tabs, and it supports visible connections between pages. It was earlier called **Static Web**, **Default Web** or **Web 1.1**.

Official specifications: https://github.com/kgcoder/readers-web-specs (document types licensed under CC BY-ND 4.0).

## Document formats

| Format | Root element | Content | File extension |
|--------|-------------|---------|----------------|
| **HDOC** | `<hdoc>` | HTML or plain text (no scripts, no styles) | `.hdoc` |
| **CDOC** | `<cdoc>` | An SVG image (a collage) | `.cdoc` |
| **CONDOC** | `<condoc>` | Connections only. Loads another site's page as the main document | `.condoc` |

- **HDOC** is the main text format: XML-based, with no scripts or styles. Structure: `<metadata>`, `<header>`, `<fallback>`, `<content>`, `<panels>`, `<copy-info>`, `<connections>`.
- **CDOC** content is an SVG collage. Connections attach to x/y points on it.
- **CONDOC** shows an external URL as the left-hand document and connects it to pages on the right, so a third-party page can be annotated without changing it.

### Embedded variants
These piggyback on regular HTML pages, so one URL serves both ordinary visitors and Reader's-Web-aware clients:
- **Embedded HDOC:** a `<div class="hdoc-content">` holds the content, and a `<script type="application/json" id="hdoc-data">` holds the metadata (header, panels, connections, removal selectors).
- **Embedded CDOC:** the CDOC source is in `<script type="application/json" id="cdoc-source">`.
- **Embedded CONDOC:** the same, with `id="condoc-source"`.

## Visible connections

Documents are linked by **visible connections**, called "floating links" or "flinks" in the code. A connection specifies the target document URL, the source anchor (a text range in an HDOC or a point in a CDOC) and the destination anchor. The main document is shown on the left; connected documents open in tabs on the right, inside the reader UI.
