/*
RW Reader UI

Copyright (c) 2025 Karen Grigorian
Code licensed under the MIT License. See LICENSE.

This software implements document types defined by the Reader's Web project.

Reader's Web document types are licensed under CC BY-ND 4.0 and are maintained externally.

For the official list of document types and specifications, see:
https://github.com/kgcoder/readers-web-specs
*/

// Text, hashing and sanitizing helpers behind text anchors (the text ends of flinks), plus the
// anchoring checks themselves. Unlike helpers.js this module doesn't import Globals.js, so tools
// outside the reader (e.g. a page builder) can use it without loading the whole reader.

import DOMPurify from './dompurify/purify.es.mjs'
import SHA256 from './hashing/sha256-es/src/sha256.js'


export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
}


export function getShortHash(string,length = 6){
    const longHash =  SHA256.hash(string)
    return longHash.substring(0,length)
}


export function base64Encode(str) {
  // Convert to UTF-8 bytes
  const bytes = new TextEncoder().encode(str);
  // Convert bytes → binary string → base64
  const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
  return btoa(binary);
}


export function base64Decode(base64) {
  // Decode base64 → binary string
  const binary = atob(base64);
  // Convert binary string → bytes → UTF-8 text
  const bytes = Uint8Array.from(binary, ch => ch.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}


export function isSubstringUniqueInText(substring,text){

    if (typeof substring !== "string" || typeof text !== "string") {
        throw new Error("Both substring and text must be strings");
    }

    if (substring === "") return false; // Edge case: Empty substring


    const first = text.indexOf(substring);
    if (first === -1) return false; // doesn't occur at all (shouldn't happen in practice)

    const last = text.lastIndexOf(substring);
    return first === last; // only one occurrence

}


export function getTextNodesArrayFromDiv(div){
    const textNodesArray = []

    const getTextNodesArray = (node) => {
        if (node.nodeType === 3) { 
            textNodesArray.push(node)
        }
        if (node = node.firstChild) do {
            getTextNodesArray(node);
        } while (node = node.nextSibling);
    }
    getTextNodesArray(div)

    return textNodesArray
}


export function getTextFromDiv(div){
    const textNodesArray = getTextNodesArrayFromDiv(div)
   // 
    return textNodesArray.map(node => node.data).join('')
}


export function sanitizeHtml(htmlString, additionalForbiddenTags = []) {
    
    const htmlParser = new DOMParser();

    const htmlDoc = htmlParser.parseFromString(htmlString, 'text/html');


    htmlDoc.querySelectorAll('[style]').forEach(el => {
        el.removeAttribute('style');
    });

    htmlDoc.querySelectorAll('font[size]').forEach(el => {
        el.removeAttribute('size');
    });

    htmlDoc.querySelectorAll("img.lazyload").forEach(img => {
    const realSrc = img.getAttribute("data-src") || img.getAttribute("data-lazy");
    if (realSrc) {
      img.setAttribute("src", realSrc);
    }
    img.classList.remove("lazyload");
  });


    const forbiddenTags = ["script", "object", "embed", "link", "style", "meta", "form", "base", "head",
        "webview", "button", "input", "textarea", "select", "option", "optgroup", "label", "fieldset", "legend", "datalist", ".hdoc-remove", ...additionalForbiddenTags];
    
    forbiddenTags.forEach(tag => {
        try{
            htmlDoc.querySelectorAll(tag).forEach(el => el.remove());
        }catch(e){
            //invalid selector
        }
    });

    htmlDoc.querySelectorAll("*").forEach(el => {
        [...el.attributes].forEach(attr => {
            if (attr.name.startsWith("on") || attr.value.trim().toLowerCase().startsWith("javascript:")) {
                el.removeAttribute(attr.name);
            }
        });
    });

    let sanitizedHtml = htmlDoc.body.innerHTML
    sanitizedHtml = sanitizedHtml.replace(/<iframe([^<]*?)\/>/gim,'<iframe$1></iframe>')


    const allowedTags = ['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'search', 'section', 'select', 'shadow', 'slot', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr'];

    const purifiedHtml = DOMPurify.sanitize(sanitizedHtml,{
        ALLOWED_TAGS: allowedTags,   // allow all tags (except obviously unsafe ones)
        ALLOWED_ATTR: false,   // allow all safe attributes
        ADD_TAGS: ['iframe'],  // explicitly allow <iframe>
        ADD_ATTR: ['target','allow', 'allowfullscreen', 'frameborder', 'src', 'height', 'width', 'referrerpolicy', 'loading', 'href', 'class', 'id'],
    });



    return purifiedHtml != null ? purifiedHtml : ''






}


export function removeTitleFromContent(htmlString, titleText, titleSelector) {

    const htmlParser = new DOMParser();

    const htmlDoc = htmlParser.parseFromString(htmlString, 'text/html');

    try{
        const titleEl = htmlDoc.querySelector(titleSelector != null ? titleSelector : 'h1')
        if (titleEl && titleEl.textContent.trim() === titleText.trim()) {
            titleEl.parentElement.removeChild(titleEl)  
        }
     }catch(e){
        //invalid selector (shouldn't get here)
    }

    return htmlDoc.body.innerHTML

}


// Looks for a text end that has moved: the substring that starts with leftHLetter, ends with rightHLetter,
// is originalHLength long and has originalHash. Returns the new {newStartIndex, newStartHIndex}, or null
// if it isn't found or isn't unique in text.
export function getIndicesForLinkInText(text,originalStartIndex,originalHash,originalHIndex,originalHLength,leftHLetter,rightHLetter){
    if (originalHLength.length > text.length) return null
    if(!leftHLetter || !rightHLetter)return null

    let newStartHIndex = 0

    let hashSubstring = ''
        
    let newStartIndex = -1

    let result;
    const lengthWithin = originalHLength - 2
    if(lengthWithin < 0)return null
 
    const reg = new RegExp(
    `(?=(${escapeRegExp(leftHLetter)}[\\s\\S]{${lengthWithin}}${escapeRegExp(rightHLetter)}))`,
    'g'
    );

    while ((result = reg.exec(text))) {
        const matchedText = result[1] || ''

        newStartHIndex = result.index

        const newHash = getShortHash(matchedText)
        
        if (newHash === originalHash) {
            newStartIndex = originalStartIndex - originalHIndex + newStartHIndex
            hashSubstring = matchedText
            break
        }

        reg.lastIndex = result.index + 1;
        
    }
    
    
    if(newStartIndex === -1)return null

    if(!hashSubstring)return null

    if (!isSubstringUniqueInText(hashSubstring, text)) {
        return null
    }

    return {newStartIndex, newStartHIndex}

 
}


// Whether a text end (FLTextEnd) still points at the text it was made for: the hashed range covers the
// linked range, and the hashed substring is unique in text and has the stored hash.
export function isTextEndIntact(text, end) {
    if (end.hIndex > end.index || end.hIndex + end.hLength < end.index + end.length) return false
    const line = text.substring(end.hIndex, end.hIndex + end.hLength)
    if (!isSubstringUniqueInText(line, text)) return false
    return getShortHash(line) === end.hash
}
