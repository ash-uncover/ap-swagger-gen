/* tslint:disable:no-empty-interface */

// @see https://swagger.io/specification/

// Open API types

export interface OpenAPIModel {
    openapi: string
    info: OpenAPIInfo
    jsonSchemaDialect?: string
    servers: OpenAPIServer
    paths: OpenAPIPaths
    webhooks: {
        [key: string]: OpenAPIPathItem | OpenAPIReference
    }
    components: OpenAPIComponents
    security: OpenAPISecurityRequirement
    tags: OpenAPITag[]
}

export interface OpenAPIInfo {
    title: string
    summary?: string
    description?: string
    termsOfService?: string
    contact: OpenAPIContact
    licence: OpenAPILicence
    version: string
}

export interface OpenAPIContact {
    name: string
    url?: string
    email?: string
}

export interface OpenAPILicence {
    name: string
    identifier?: string
    url?: string
}

export interface OpenAPIServer {
    url: string
    description?: string
    variables?: {
        [key: string]: OpenAPIServerVariable
    }
}

export interface OpenAPIServerVariable {
    enum?: string[]
    default: string
    description?: string
}

export interface OpenAPIComponents {
    schemas?: {
        [key: string]: OpenAPISchema
    }
    responses?: {
        [key: string]: OpenAPIResponse | OpenAPIReference
    }
    parameters?: {
        [key: string]: OpenAPIParameter | OpenAPIReference
    }
    examples?: {
        [key: string]: OpenAPIExample | OpenAPIReference
    }
    requestBodies?: {
        [key: string]: OpenAPIRequestBody | OpenAPIReference
    }
    headers?: {
        [key: string]: OpenAPIHeader | OpenAPIReference
    }
    securitySchemes?: {
        [key: string]: OpenAPISecurityScheme | OpenAPIReference
    }
    links?: {
        [key: string]: OpenAPILink | OpenAPIReference
    }
    callbacks?: {
        [key: string]: OpenAPICallback | OpenAPIReference
    }
    pathItems?: {
        [key: string]: OpenAPIPathItem | OpenAPIReference
    }
}

export interface OpenAPIPaths {
    [key: string]: OpenAPIPathItem
}

export interface OpenAPIPathItem {
    $ref?: string
    summary?: string
    description?: string
    get?: OpenAPIOperation
    put?: OpenAPIOperation
    post?: OpenAPIOperation
    delete?: OpenAPIOperation
    options?: OpenAPIOperation
    patch?: OpenAPIOperation
    trace?: OpenAPIOperation
    server?: OpenAPIServer
    parameters?: (OpenAPIParameter | OpenAPIReference)[]
}

export interface OpenAPIOperation {
    tags?: string[]
    summary?: string
    description?: string
    externalDocs?: OpenAPIExternalDocumentation
    operationId: string
    parameters?: (OpenAPIParameter | OpenAPIReference)[]
    requestBody?: OpenAPIRequestBody | OpenAPIReference
    responses?: OpenAPIResponses
    callbacks: {
        [key: string]: OpenAPICallback | OpenAPIReference
    }
    deprecated?: boolean
    security?: OpenAPISecurityRequirement
    servers?: OpenAPIServer
}

export interface OpenAPIExternalDocumentation {
    description?: string
    url?: string
}

export interface OpenAPIParameter {
    name: string
    in: 'query' | 'header' | 'path' | 'cookie'
    description?: string
    required?: boolean
    deprecated?: boolean
    allowEmptyValue?: boolean
    style?: 'matrix' | 'label' | 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject'
    explode?: boolean
    allowReserved?: boolean
    schema?: OpenAPISchema
    example?: any
    examples?: {
        [key: string]: OpenAPIExample | OpenAPIReference
    }
    content?: {
        [key: string]: OpenAPIMediaType
    }
}

export interface OpenAPIRequestBody {
    description?: string
    content: {
        [key: string]: OpenAPIMediaType
    }
    required?: boolean
}

export interface OpenAPIMediaType {
    schema?: OpenAPISchema
    example?: any
    examples?: {
        [key: string]: OpenAPIExample | OpenAPIReference
    }
    encoding?: {
        [key: string]: OpenAPIEncoding
    }
}

export interface OpenAPIEncoding {
    contentType?: string
    headers?: {
        [key: string]: OpenAPIHeader | OpenAPIReference
    }
    style?: string
    explode?: boolean
    allowReserved?: boolean
}

export interface OpenAPIResponses {
    [key: string]: OpenAPIResponse | OpenAPIReference
}

export interface OpenAPIResponse {
    description: string
    headers?: {
        [key: string]: OpenAPIHeader | OpenAPIReference
    }
    content?: {
        [key: string]: OpenAPIMediaType
    }
    links?: {
        [key: string]: OpenAPILink | OpenAPIReference
    }
}

export interface OpenAPICallback {
    [key: string]: OpenAPIPathItem | OpenAPIReference
}

export interface OpenAPIExample {
    summary?: string
    description?: string
    value?: any
    externalValue?: string
}

export interface OpenAPILink {
    operationRef?: string
    operationId?: string
    parameters?: {
        [key: string]: any
    }
    requestBody?: any
    description?: string
    server?: OpenAPIServer
}

export interface OpenAPIHeader extends OpenAPIParameter {
    name: never
    in: never
}

export interface OpenAPITag {
    name: string
    description?: string
    externalDocs?: OpenAPIExternalDocumentation
}

export interface OpenAPIReference {
    $ref: string
    summary?: string
    description?: string
}

export interface OpenAPISchema {
    discriminator?: OpenAPIDiscriminator
    xml?: OpenAPIXml
    externalDocs?: OpenAPIExternalDocumentation

    type?: string
    title?: string
    description?: string
    properties?: JsonSchemaProperties
    allOf?: JsonSchemaAllOf[]
    required?: string[]
}

export interface OpenAPIDiscriminator {
    propertyName: string
    mapping?: {
        [key: string]: string
    }
}

export interface OpenAPIXml {
    name?: string
    namespace?: string
    prefix?: string
    attribute?: boolean
    wrapped?: boolean
}

export interface OpenAPISecurityScheme {
    type: 'apiKeys' | 'http' | 'mutualTLS' | 'oauth2' | 'openIdConnect'
    description?: string
    name: string
    in: string
    scheme: string
    bearerFormat?: string
    flows: OpenAPIOauthFlows
    openIdConnectUrl: string
}

export interface OpenAPIOauthFlows {
    implicit?: OpenAPIOauthFlow
    passworf?: OpenAPIOauthFlow
    clientCredentials?: OpenAPIOauthFlow
    authorizationCode?: OpenAPIOauthFlow
}

export interface OpenAPIOauthFlow {
    authorizationUrl: string
    tokenUrl: string
    refreshUrl?: string
    scopes: {
        [key: string]: string
    }
}

export interface OpenAPISecurityRequirement {
    [key: string]: string[]
}

// JSON Scheam partial types (no need for more so far)

export interface JsonSchemaProperties {
    [key:string]: JsonSchemaProperty
}

export interface JsonSchemaProperty {
    $ref?: string
    type?: string
}

export interface JsonSchemaAllOf extends JsonSchemaProperty {
    properties?: JsonSchemaProperties
}

export default OpenAPIModel