import type {
    SwaggerSchemas,
    SwaggerSchema,
    SwaggerPaths,
    SwaggerPath,
    SwaggerMethodPost,
    SwaggerMethodGet,
    SwaggerMethodPut,
    SwaggerMethodDelete,
    SwaggerMethodParameter,
    SwaggerSchemaProperty,
    SwaggerSchemaProperties,
    SwaggerSchemaAllOf,
    SwaggerMethod
} from './swagger-model'

import type {
    Model,
    ModelProperty,
    Service,
    ServiceEndpoint,
    ServiceEndpointParameter,
    ServiceNode,
} from '../generator/generator-models'

import * as utils from '../utils/utils'

// --------------------------------------------
// Schemas
// --------------------------------------------

export const buildSchemas = (schemas:SwaggerSchemas):Model[] => {
    return Object.keys(schemas)
        .sort()
        .map((key:string) => {
            const schema = schemas[key]
            return buildSchema(key, schema)
        })
}

export const buildSchema = (key:string, schema:SwaggerSchema):Model => {
    utils.log(`buildSchema ${key}`)
    const model:Model = {
        name: key,
        description: schema.title || schema.description || key,
        properties: [],
    }
    switch (schema.type) {
        case 'object': {
            if (schema.properties) {
                model.properties = buildSchemaProperties(schema.properties, schema.required)
            } else if (schema.allOf) {
                const allOf = buildSchemaAllOf(schema.allOf, schema.required)
                model.extends = allOf.ext
                model.properties = allOf.properties
            }
            break
        }
        default: {
            throw new Error(`Unknown type ${schema.type} for schema ${key}`)
        }
    }
    return model
}

export const buildSchemaProperties = (properties:SwaggerSchemaProperties, required:string[]|undefined):ModelProperty[] => {
    return Object.keys(properties)
        .sort()
        .map((key:string) => {
            const isRequired = Boolean(required && required.includes(key))
            const property = properties[key]
            return buildObjectProperty(key, property, isRequired)
        })
}

export const buildSchemaAllOf = (allOf:SwaggerSchemaAllOf[], required:string[]|undefined):{ext?:string[], properties?:ModelProperty[]} => {
    const result = allOf.reduce((acc:{ext?:string[], properties?:ModelProperty[]}, item:SwaggerSchemaAllOf) => {
        const ref = item.$ref
        const properties = item.properties
        if (ref) {
            acc.ext = acc.ext || []
            acc.ext.push(getPropertyType(item))
        } else if (properties) {
            acc.properties = acc.properties || []
            acc.properties.push(...buildSchemaProperties(properties, required))
        } else {
            throw new Error('Unsupported allOf entry')
        }
        return acc
    }, {})
    return result
}

export const buildObjectProperty = (key:string, property:SwaggerSchemaProperty, required:boolean):ModelProperty => {
    utils.log(`  - buildProperty ${key}`)
    const result:ModelProperty = {
        name: key,
        required,
        type: getPropertyType(property)
    }
    return result
}

export const getPropertyType = (property:any):string => {
    if (property.type) {
        switch (property.type) {
            case 'string': {
                if (property.enum) {
                    return property.enum
                        .map((v:string) => `'${v}'`)
                        .join(' | ')
                }
                break;
            }
            case 'integer': {
                return 'Number'
            }
            case 'array': {
                if (property.items) {
                    return `Array<${getPropertyType(property.items)}>`
                }
                throw new Error('Unsupported array property')
            }
            default: {
                break;
            }
        }
        return utils.capitalize(property.type)
    }
    if (property.$ref) {
        return property.$ref.replace('#/components/schemas/', '')
    }
    if (property.oneOf) {
        return property.oneOf
            .map(getPropertyType)
            .join(' | ')
    }
    throw new Error('Unsupported property')
}


// --------------------------------------------
// Paths
// --------------------------------------------

export const addNode = (nodes:ServiceNode[], urlParts:string[]):ServiceNode => {
    if (!urlParts.length) {
        throw new Error('Empty url parts')
    }
    const urlPart = urlParts[0]
    let node = nodes.find(n => n.id === urlPart)
    if (!node) {
        let name = urlPart
        if (urlPart.startsWith('{') && urlPart.endsWith('}')) {
            name = `$${name.substring(1, name.length - 1)}`;
        }
        node = {
            id: urlPart,
            name,
            nodes: []
        }
        nodes.push(node)
    }
    if (urlParts.length === 1) {
        return node
    }
    const remainingParts = urlParts.slice()
    remainingParts.shift()
    return addNode(node.nodes, remainingParts)
}

export const buildPaths = (name:string, urlBase:string, paths:SwaggerPaths):Service => {
    const service:Service = {
        name,
        urlBase,
        endpoints: [],
        structure: [],
    }

    Object.keys(paths)
        .sort()
        .forEach((url:string) => {
            const path:SwaggerPath = paths[url]
            // Create structure
            const urlParts = url.split('/').filter(part => !!part)
            const node = addNode(service.structure, urlParts)
            // Create endpoints
            if (path.post) {
                service.endpoints.push(buildPathPost(url, path.post))
                node.post = checkOperationId(path.post.operationId)
            }
            if (path.get) {
                service.endpoints.push(buildPathGet(url, path.get))
                node.get = checkOperationId(path.get.operationId)
            }
            if (path.put) {
                service.endpoints.push(buildPathPut(url, path.put))
                node.put = checkOperationId(path.put.operationId)
            }
            if (path.delete) {
                service.endpoints.push(buildPathDelete(url, path.delete))
                node.delete = checkOperationId(path.delete.operationId)
            }
        })

    return service
}

export const buildPathPost = (url:string, post:SwaggerMethodPost):ServiceEndpoint => {
    const result = buildPathBase(url, post)
    result.method = 'POST'
    result.payloadType = getPayloadType(post.requestBody)
    return result
}

export const buildPathGet = (url:string, get:SwaggerMethodGet):ServiceEndpoint => {
    const result = buildPathBase(url, get)
    result.method = 'GET'
    return result
}

export const buildPathPut = (url:string, put:SwaggerMethodPut):ServiceEndpoint => {
    const result = buildPathBase(url, put)
    result.method = 'PUT'
    result.payloadType = getPayloadType(put.requestBody)
    return result
}

export const buildPathDelete = (url:string, del:SwaggerMethodDelete):ServiceEndpoint => {
    const result = buildPathBase(url, del)
    result.method = 'DELETE'
    return result
}

export const buildPathBase = (url:string, method:SwaggerMethod):ServiceEndpoint => {
    const urlParams = getUrlParameters(method.parameters)
    const queryParams = getQueryParameters(method.parameters)
    const name = checkOperationId(method.operationId)
    return {
        name,
        description: method.summary || name,
        url,
        urlParams,
        queryParams,
    }
}

export const checkOperationId = (operationId:string):string => {
    if (operationId === 'delete') {
        return 'delete_'
    }
    return operationId
}

export const getUrlParameters = (parameters:SwaggerMethodParameter[]|undefined):ServiceEndpointParameter[]|undefined => {
    const params:ServiceEndpointParameter[]|undefined = undefined
    if (parameters) {
        return parameters
            .filter(param => param.in === 'path')
            .map(param => ({
                name: checkOperationId(param.name),
                required: param.required,
                type: getPropertyType(param.schema),
            }))
    }
    return params
}

export const getQueryParameters = (parameters:SwaggerMethodParameter[]|undefined):ServiceEndpointParameter[]|undefined => {
    const params:ServiceEndpointParameter[]|undefined = undefined
    if (parameters) {
        return parameters
            .filter(param => param.in === 'query')
            .map((param):ServiceEndpointParameter => {
                return {
                    name: param.name,
                    required: param.required,
                    type: getPropertyType(param.schema),
                }
            })
    }
    return params
}

export const getPayloadType = (requestBody:any):string|undefined => {
    let payloadType:string|undefined
    if (requestBody) {
        if (requestBody.content['application/json']) {
            payloadType = getPropertyType(requestBody.content['application/json'].schema)
        } else if (requestBody.content['*/*']) {
            payloadType = getPropertyType(requestBody.content['*/*'].schema)
        } else if (requestBody.content['multipart/form-data']) {
            payloadType = 'any'
        } else {
            throw new Error('Unsupported payload type')
        }
    }
    return payloadType
}