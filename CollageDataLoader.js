/*
RW Reader UI

Copyright (c) 2025 Karen Grigorian
Code licensed under the MIT License. See LICENSE.

This software implements document types defined by the Reader's Web project.

Reader's Web document types are licensed under CC BY-ND 4.0 and are maintained externally.

For the official list of document types and specifications, see:
https://github.com/kgcoder/readers-web-specs
*/

import { parseCDOC } from "./parsers/CDOCParser.js"

export async function loadCollageContentFromFile(xmlString, url, collageId){
    const contentString = xmlString

    if(!contentString)return

    let lines = []
    const texts = []
    const links = []
    const textViews = []


    let mainImage
    let linkRects
    let markers
    let title
    let connectedDocsData

    const collageMatch = contentString.match(/<cdoc\b[^>]*>([\s\S]*?)<\/cdoc>/im)
    if(!collageMatch)return null
        const collageString = collageMatch[0]

        const data = await parseCDOC(url,collageString)


        mainImage = data.mainImage

        lines = data.lines

        linkRects = data.linkRects
        markers = data.markers

        title = data.title

        connectedDocsData = data.connectedDocsData


    


    



 

        const content = {
            info:{url, width:data.width,height:data.height},
            lines: data.lines,
            texts,
            images: data.images,
            links,
            linkRects,
            textViews,
            markers,
            mainImage,
            title,
            connectedDocsData,
            copyInfo: data.copyInfo
        }
       
        
        return content

}

