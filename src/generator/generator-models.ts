export interface Model {
    name: string
    description: string
    properties?: ModelProperty[]
    extends?:string[]
}

export interface ModelProperty {
    name: string
    required: boolean
    type: string
}

export interface Service {
    name: string
    urlBase: string
    endpoints: ServiceEndpoint[]
    structure: ServiceNode[]
}

export interface ServiceEndpoint {
    name: string
    description: string
    url: string
    urlParams?: ServiceEndpointParameter[]
    queryParams?: ServiceEndpointParameter[]
    payloadType?: string
    responseType?: string
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
}

export interface ServiceEndpointParameter {
    name: string
    required: boolean
    type: string
}

export interface ServiceNode {
    id: string
    name: string
    nodes: ServiceNode[]
    post?: string
    get?: string
    put?: string
    delete?: string
}