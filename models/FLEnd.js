/*
RW Reader UI

Copyright (c) 2025 Karen Grigorian
Code licensed under the MIT License. See LICENSE.

This software implements document types defined by the Reader's Web project.

Reader's Web document types are licensed under CC BY-ND 4.0 and are maintained externally.

For the official list of document types and specifications, see:
https://github.com/kgcoder/readers-web-specs
*/

import FLPointEnd from "./FLPointEnd.js"
import FLTextEnd from "./FLTextEnd.js"

class FLEnd{

    static fromObject(object){
        const {t:type} = object
        if(type === 't'){
            return FLTextEnd.fromObject(object)
        }else if(type === 'p'){
            return FLPointEnd.fromObject(object)
        }
    }


}

export default FLEnd