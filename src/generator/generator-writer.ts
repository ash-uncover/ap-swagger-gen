import type {
    Model,
    ModelProperty,
    Service,
    ServiceEndpoint,
    ServiceNode,
} from './generator-models'

import { capitalize, indent } from '../utils/utils'

const fs = require('fs')


// MODELS //

export const writeModels = (file:string, models:Model[]) => {
    const modelsDefinition = models.map(convertModel)
    fs.writeFileSync(file, modelsDefinition.join('\n'))
}

export const convertModel = (model:Model):string => {
    const result:string[] = []
    result.push(`// ${model.description}`)
    result.push(`export interface ${model.name} ${model.extends ? `extends ${model.extends.join(', ')} ` : ''}{`)
    if (model.properties) {
        model.properties.forEach(property => {
            result.push(convertModelProperty(property))
        })
    }
    result.push(`}`)
    return result.join('\n')
}

export const convertModelProperty = (property:ModelProperty):string => {
    return `${indent(1)}${property.name}${property.required?'':'?'}: ${property.type}`
}


// SERVICES //

export const writeService = (file:string, models:Model[], service:Service) => {
    const modelImports = convertModelImport(service.name, models)
    const endpointsDefinition = service.endpoints.map(endpoint => {
        const comment = convertEndpointComment(service, endpoint)
        const code = convertEndpoint(service, endpoint)
        return  `${comment}\n${code}`
    })
    const structureDefinition = convertStructure(service)
    fs.writeFileSync(file, [modelImports, ...endpointsDefinition, structureDefinition].join('\n'))
}

export const convertModelImport = (name:string, models:Model[]):string => {
    const result:string[] = []
    result.push(`import Service from '../service'`)
    result.push(`import {`)
    result.push(...models.map(model => `${indent(1)}${model.name},`))
    result.push(`} from './${name}.model'`)
    result.push(``)
    return result.join('\n')
}

export const convertEndpointComment = (service:Service, endpoint:ServiceEndpoint):string => {
    const result:string[] = []
    result.push(`/**`)
    result.push(` * ${endpoint.method} ${endpoint.url}`)
    result.push(` * ${endpoint.description}`)
    if (endpoint.urlParams?.length) {
        result.push(...endpoint.urlParams.map(param => ` * @param {${param.type}} ${param.name} - URL parameter`))
    }
    if (endpoint.queryParams?.length) {
        const queryParams = endpoint.queryParams.map(param => `'${param.name}'${param.required ? '' : '?'}:${param.type}`)
        result.push(` * @param {${queryParams}} query - Query parameters`)
    }
    result.push(` */`)
    return result.join('\n')
}

export const convertEndpoint = (service:Service, endpoint:ServiceEndpoint):string => {
    const result:string[] = []
    const params:string[] = []
    if (endpoint.urlParams?.length) {
        params.push(...endpoint.urlParams.map(param => `${param.name}:${param.type}`))
    }
    if (endpoint.queryParams?.length) {
        const queryParams = endpoint.queryParams.map(param => `'${param.name}'${param.required ? '' : '?'}:${param.type}`)
        params.push(`query:{${queryParams.join(', ')}}`)
    }
    if (endpoint.payloadType) {
        params.push(`payload:${endpoint.payloadType}`)
    }
    result.push(`export const ${endpoint.name} = async (${params.join(', ')}) => {`)
    let url = endpoint.url.split('{').join('${')
    if (endpoint.queryParams?.length) {
        url += '?'
        url += endpoint.queryParams.map(param => `${encodeURIComponent(param.name)}=\${encodeURIComponent(String(query['${param.name}']))}`).join('&')
    }
    result.push(`${indent(1)}const url = \`${url}\``)
    result.push(`${indent(1)}const options = {`)
    result.push(`${indent(2)}method: '${endpoint.method}',`)
    if (endpoint.payloadType) {
        if (endpoint.payloadType === 'any') {
            result.push(`${indent(2)}body: payload,`)
        } else {
            result.push(`${indent(2)}body: JSON.stringify(payload),`)
        }
    }
    result.push(`${indent(1)}}`)
    result.push(`${indent(1)}const response = await ${capitalize(service.name)}Service.fetch(url, options)`)
    result.push(`${indent(1)}const responseData = await response.json()`)
    result.push(`${indent(1)}return responseData`)
    result.push(`}`)
    result.push(``)
    return result.join('\n')
}

export const convertStructure = (service: Service):string => {
    const result:string[] = []
    result.push(`const ${capitalize(service.name)}Service = new Service('${service.urlBase}', {`)
    result.push(convertStructureNodes(1, service.structure))
    result.push(`})`)
    result.push(``)
    result.push(`export default ${capitalize(service.name)}Service`)
    result.push(``)
    return result.join('\n')
}

export const convertStructureNodes = (depth:number, nodes: ServiceNode[]):string => {
    const result:string[] = []
    result.push(...nodes.map(node => convertStructureNode(depth, node)))
    return result.join('\n')
}

export const convertStructureNode = (depth:number, node: ServiceNode):string => {
    const result:string[] = []
    result.push(`${indent(depth)}'${node.name}': {`)
    if (node.post) {
        result.push(`${indent(depth + 1)}post: ${node.post},`)
    }
    if (node.get) {
        result.push(`${indent(depth + 1)}get: ${node.get},`)
    }
    if (node.put) {
        result.push(`${indent(depth + 1)}put: ${node.put},`)
    }
    if (node.delete) {
        result.push(`${indent(depth + 1)}delete: ${node.delete},`)
    }
    if (node.nodes) {
        result.push(...node.nodes.map(n => convertStructureNode(depth + 1, n)))
    }
    result.push(`${indent(depth)}},`)
    return result.join('\n')
}


// INDEXES //

export const writeIndex = (file:string, name:string) => {
    const indexDefinition = convertIndex(name)
    fs.writeFileSync(file, indexDefinition)
}

export const convertIndex = (name:string):string => {
    const result = [
        `import Service from './${name}.service'`,
        `import * as Model from './${name}.model'`,
        '',
        `export default {`,
        '    Model,',
        '    Service,',
        '}',
        '',
    ]
    return result.join('\n')
}


// GLOBAL INDEX //

export const writeGlobalIndex = (file:string, services:string[]) => {
    const indexDefinition = convertGlobalIndex(services)
    fs.writeFileSync(file, indexDefinition)
}

export const convertGlobalIndex = (services:string[]):string => {
    const result:string[] = []
    result.push(...services.map((service) => `import ${capitalize(service)} from './services/${service}'`))
    result.push('')
    result.push(...services.map((service) => `export const ${capitalize(service)}Service = ${capitalize(service)}.Service`))
    result.push('')
    result.push(...services.map((service) => `export const ${capitalize(service)}Model = ${capitalize(service)}.Model`))
    result.push('')
    result.push('export default {')
    result.push(...services.map((service) => `${indent(1)}${capitalize(service)},`))
    result.push('}')
    result.push('')
    return result.join('\n')
}
