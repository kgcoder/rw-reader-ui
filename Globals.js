/*
RW Reader UI

Copyright (c) 2025 Karen Grigorian
Code licensed under the MIT License. See LICENSE.

This software implements document types defined by the Reader's Web project.

Reader's Web document types are licensed under CC BY-ND 4.0 and are maintained externally.

For the official list of document types and specifications, see:
https://github.com/kgcoder/readers-web-specs
*/

import NoteDivsManager from "./NoteDivsMethods.js";
import PopupDocumentManager from "./PopupDocumentManager.js";
import ReadingManager from "./ReadingManager.js";

const Globals = {

    pdm: new PopupDocumentManager(),
    readingManager: new ReadingManager(),
    noteDivsManager: new NoteDivsManager(),
    hostAdapter: null,
    adminBarHeight: 0

}

export default Globals




/*
 doc subtypes
 0. local hdoc (with markdown)
 1. standalone hdoc
 2. embedded hdoc
 3. generated hdoc (using parsing rules)
 4. generated hdoc (using Readability)
 5. cdoc
 6. sdoc (doesn't exist yet)
 7. condoc
 8. embedded cdoc
 9. embedded condoc
*/