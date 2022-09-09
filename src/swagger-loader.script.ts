import type SwaggerModel from './swagger/swagger-model'
import * as SwaggerUtils from './swagger/swagger-utils'

import type {
    Model,
    Service,
} from './generator/generator-models'

import {
    writeModels,
    writeService,
    writeIndex,
    writeGlobalIndex,
} from './generator/generator-writer'

const fs = require('fs')
const TypeDoc = require("typedoc");

const services = [
    'control',
    'galaxy',
    'profile',
    'runtime',
    'webapi',
]

const URL_SERVER = 'https://ipa-deploy--master1.app.ipa.master-nightly.cfapps.sap.hana.ondemand.com'

// Generate service files

const files:string[] = []

services.forEach(service => {
    const rawdata = fs.readFileSync(`resources/swagger/api-docs-${service}.json`)
    const docs:SwaggerModel = JSON.parse(rawdata)
    const urlBase = docs.servers[0].url.replace(URL_SERVER, '')

    try {
        const modelsDefinition:Model[] = SwaggerUtils.buildSchemas(docs.components.schemas)
        writeModels(`src/services/${service}/${service}.model.ts`, modelsDefinition)
        files.push(`src/services/${service}/${service}.model.ts`)

        const serviceDefinition:Service = SwaggerUtils.buildPaths(service, urlBase, docs.paths)
        writeService(`src/services/${service}/${service}.service.ts`, modelsDefinition, serviceDefinition)
        files.push(`src/services/${service}/${service}.service.ts`)

        writeIndex(`src/services/${service}/index.ts`, service)

    } catch (err) {
        console.error('*********************************************')
        console.error(`error while loading service: ${service}`)
        console.error(err)
    }
})

writeGlobalIndex(`src/index.ts`, services)

async function main() {
    const app = new TypeDoc.Application();

    // If you want TypeDoc to load tsconfig.json / typedoc.json files
    app.options.addReader(new TypeDoc.TSConfigReader());
    app.options.addReader(new TypeDoc.TypeDocReader());

    app.bootstrap({
        // typedoc options here
        entryPoints: files,
    });

    const project = app.convert();

    if (project) {
        // Project may not have converted correctly
        const outputDir = "docs";

        // Rendered docs
        await app.generateDocs(project, outputDir);
        // Alternatively generate JSON output
        await app.generateJson(project, outputDir + "/documentation.json");
    }
}

main().catch(console.error);
