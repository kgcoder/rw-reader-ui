/*
RW Reader UI

Copyright (c) 2025 Karen Grigorian
Code licensed under the MIT License. See LICENSE.

This software implements document types defined by the Reader's Web project.

Reader's Web document types are licensed under CC BY-ND 4.0 and are maintained externally.

For the official list of document types and specifications, see:
https://github.com/kgcoder/readers-web-specs
*/

import g from './Globals.js'
import { setTheme } from './helpers.js'
import { setFontSet } from './Fonts.js'


export const checkKey = async (e) => {

    if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        if(!g.hostAdapter.allowFontResizing)return
        e.preventDefault()
        g.pdm.updateFontSize(-1)   
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        if(!g.hostAdapter.allowFontResizing)return
        e.preventDefault()
        g.pdm.updateFontSize(1)
        
            
    }

    if(e.code === 'Escape'){
        g.readingManager.processEscape()
    }

    if (e.code === 'KeyF') {
        if(e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)return
        if(g.readingManager.rightNotesData.length){
            g.pdm.toggleFullScreen()
        }
    }
    if (e.key === '[' && e.ctrlKey) {

        if(!g.hostAdapter.allowDynamicThemeChange)return

        if (!g.favorites || !g.favorites.length) return

        const currentIndex = g.favorites.findIndex(f => f.theme === g.currentTheme && f.fontSetId === g.currentFontSet)
        const next = g.favorites[(currentIndex + 1) % g.favorites.length]

        setTheme(next.theme, true)
        setFontSet(next.fontSetId, true)

    }



    if (e.code === "KeyL") {
        g.readingManager.linkCreationButtonPressed()
    }

    if (e.keyCode == '8') {
        // delete (backspace)
        g.readingManager.deleteSelectedFlinks()
          
    }
}