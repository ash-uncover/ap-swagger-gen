/* tslint:disable:no-console */

const INDENTATION = '  '

const DEBUG = false

export const log = (msg:string, forceDebug?:boolean) => {
    if (DEBUG || forceDebug) {
        console.log(msg)
    }
}

export const indent = (depth:number):string => {
    if (depth) {
        return `${INDENTATION}${indent(depth - 1)}`
    }
    return ''
}

export const capitalize = (value:string|null|undefined):string => {
    if (value && value.length) {
        return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return ''
}