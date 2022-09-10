#!/usr/bin/env node

'use strict'

process.title = 'js-swagger-generator'

import * as fs from 'fs'

import {
    GeneratorWriter,
    SwaggerUtils
} from '../build/index.js'

const ARGS = {
    FILES: {
        id: ['files'],
        required: true,
        hasValue: true
    },
    OUTPUT: {
        id: ['output'],
        required: true,
        hasValue: true
    },
    HELP: {
        id: ['help', '?'],
        required: false,
        hasValue: false
    }
}

process.argv.splice(0, 2)

let invalidArgs = false

const actualArgs = {
    output: null,
    files: null
}

console.log ('')

const exitWithError = (msg) => {
    console.log('')
    console.log(msg)
    console.log('')
    process.exit(1)
}

process.argv.forEach((arg) => {
    // Check argument prefix
    if (!arg.startsWith('--')) {
        invalidArgs = true
        console.error(`Invalid argument: ${arg}`)
        return
    }

    arg = arg.substring(2)
    let [key, value] = arg.split('=')
    key = key.toLowerCase()

    if (ARGS.FILES.id.includes(key)) {
        if (!value) {
            invalidArgs = true
            console.error(`Invalid argument: ${key} requires value`)
        } else {
            actualArgs.files = value
        }

    } else if (ARGS.OUTPUT.id.includes(key)) {
        if (!value) {
            invalidArgs = true
            console.error(`Invalid argument: ${key} requires value`)
        } else {
            actualArgs.output = value
        }

    } else if (ARGS.HELP.id.includes(key)) {
        console.log('HELP')
        process.exit(0)
    }
})

if (actualArgs.files === null) {
    console.log('Missing argument: --files')
}
if (actualArgs.output === null) {
    console.log('Missing argument: --output')
}
if (invalidArgs || actualArgs.files === null || actualArgs.output === null) {
    exitWithError('Invalid argument: use --? for help')
}

const filesStats = fs.lstatSync(actualArgs.files)
const outputStats = fs.lstatSync(actualArgs.output)

if (!outputStats.isDirectory()) {
    console.error(`Invalid argument: output must point to a directory`)
    exitWithError('Invalid argument: use --? for help')
}

let listPromise
if (filesStats.isDirectory()) {
    console.log(`> reading directory: '${actualArgs.files}'`)
    listPromise = new Promise((resolve, reject) => {
        const filesList = []
        fs.readdir(actualArgs.files, (err, files) => {
            if (err) {
                reject(err)
            } else {
                files.forEach((file) => {
                    console.log(`  > file: '${file}'`)
                    filesList.push(file)
                })
                resolve(filesList)
            }
        })
    })
} else {
    console.log(`> reading file ${actualArgs.files}`)
    listPromise = Promise.resolve(actualArgs.files)
}


listPromise.then((files) => {
    console.log(`> output directory: '${actualArgs.output}'`)

    // Generate service files

    let services = []
    files.forEach(file => {
        const rawdata = fs.readFileSync(file, 'utf8')
        const docs = JSON.parse(rawdata)
        const url = docs.servers[0].url
        const urlParts = url.split('/');
        const server = urlParts[0]
        const service = urlParts[urlParts.length - 1]
        const urlBase = url.replace(server, '')
        services.push(service)

        console.log(`  > building service: '${service}'`)

        try {
            const modelsDefinition = SwaggerUtils.buildSchemas(docs.components.schemas)
            GeneratorWriter.writeModels(`${actualArgs.output}/services/${service}/${service}.model.ts`, modelsDefinition)
            files.push(`${actualArgs.output}/services/${service}/${service}.model.ts`)

            console.log(`    > output model: '${actualArgs.output}/services/${service}/${service}.model.ts'`)

            const serviceDefinition = SwaggerUtils.buildPaths(service, urlBase, docs.paths)
            GeneratorWriter.writeService(`${actualArgs.output}/services/${service}/${service}.service.ts`, modelsDefinition, serviceDefinition)
            files.push(`${actualArgs.output}/services/${service}/${service}.service.ts`)

            console.log(`    > output service: '${actualArgs.output}/services/${service}/${service}.service.ts'`)

            GeneratorWriter.writeIndex(`${actualArgs.output}/services/${service}/index.ts`, service)

            console.log(`    > output index: '${actualArgs.output}/services/${service}/index.ts'`)

        } catch (err) {
            console.error('*********************************************')
            console.error(`error while loading service: ${service}`)
            console.error(err)
        }
    })

    GeneratorWriter.writeGlobalIndex(`${actualArgs.output}/index.ts`, services)

    console.log(`  > output global index`)

    console.log('')
})
