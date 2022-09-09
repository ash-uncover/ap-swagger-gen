export interface SwaggerModel {
    components: SwaggerComponents
    info: any
    openapi: string
    paths: SwaggerPaths
    servers: any
}

export interface SwaggerComponents {
    schemas: SwaggerSchemas
}

export interface SwaggerSchemas {
    [key:string]: SwaggerSchema
}

export interface SwaggerSchema {
    type: string
    title?: string
    description?: string
    properties?: SwaggerSchemaProperties
    allOf?: SwaggerSchemaAllOf[]
    required?: string[]
}

export interface SwaggerSchemaAllOf extends SwaggerSchemaProperty {
    properties?: SwaggerSchemaProperties
}

export interface SwaggerSchemaProperties {
    [key:string]: SwaggerSchemaProperty
}

export interface SwaggerSchemaProperty {
    $ref?: string
    type?: string
}


export interface SwaggerPaths {
    [key:string]: SwaggerPath
}

export interface SwaggerPath {
    post?: SwaggerMethodPost
    get?: SwaggerMethodGet
    put?: SwaggerMethodPut
    delete?: SwaggerMethodDelete
}

export interface SwaggerMethod {
    operationId: string
    parameters: SwaggerMethodParameter[]
    responses: any
    summary?: string
    tags?: string[]
}

export interface SwaggerMethodParameter {
    description: string
    in: 'query' | 'path'
    name:string
    required: boolean
    schema: SwaggerSchema
}

export interface SwaggerMethodPost extends SwaggerMethod {
    requestBody: any
}

export interface SwaggerMethodGet extends SwaggerMethod {
}

export interface SwaggerMethodPut extends SwaggerMethod {
    requestBody: any
}

export interface SwaggerMethodDelete extends SwaggerMethod {
}

export default SwaggerModel