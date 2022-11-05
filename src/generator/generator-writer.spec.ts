/* tslint:disable:no-empty */

import * as GeneratorModel from './generator-models'
import * as GeneratorWriter from './generator-writer'

import * as fs from 'fs'

describe('generator-writer', () => {

    let stubFsWriteFileSync:jest.SpyInstance

    beforeEach(() => {
        stubFsWriteFileSync = jest.spyOn(fs, 'writeFileSync')
        stubFsWriteFileSync.mockImplementation(() => {})
    })

    afterEach(() => {
        stubFsWriteFileSync.mockRestore()
    })

    /* TEST CASES */

    // writeModel //

    describe('writeModel', () => {

        let stubConvertModel:jest.SpyInstance

        beforeEach(() => {
            stubConvertModel = jest.spyOn(GeneratorWriter, 'convertModel')
            stubConvertModel.mockImplementation(() => {})
        })

        afterEach(() => {
            stubConvertModel.mockRestore()
        })

        test('when no models are provided', () => {
            // Declaration
            const file = 'file'
            const models:GeneratorModel.Model[] = []
            // Execution
            const result = GeneratorWriter.writeModels(file, models)
            // Assertion
            expect(stubConvertModel).not.toHaveBeenCalled()
            expect(stubFsWriteFileSync).toHaveBeenCalled()
        })

        test('when some models are provided', () => {
            // Declaration
            const file = 'file'
            const models:GeneratorModel.Model[] = [
                { name: 'name', description: 'description', properties: [] },
            ]
            // Execution
            const result = GeneratorWriter.writeModels(file, models)
            // Assertion
            expect(stubConvertModel).toHaveBeenCalled()
            expect(stubFsWriteFileSync).toHaveBeenCalled()
        })
    })

    // convertModel //

    describe('convertModel', () => {

        let stubConvertModelProperty:jest.SpyInstance

        beforeEach(() => {
            stubConvertModelProperty = jest.spyOn(GeneratorWriter, 'convertModelProperty')
            stubConvertModelProperty.mockImplementation((property) => property.name)
        })

        afterEach(() => {
            stubConvertModelProperty.mockRestore()
        })

        test('build the correct wrapper for model', () => {
            // Declaration
            const model:GeneratorModel.Model = {
                name: 'name',
                description: 'description',
                properties: [
                    { name: 'property1', required: true, type: 'type' },
                    { name: 'property2', required: true, type: 'type' },
                ],
            }
            // Execution
            const result = GeneratorWriter.convertModel(model)
            // Assertion
            const expected = [
                '// description',
                'export interface name {',
                'property1',
                'property2',
                '}'
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('build the correct wrapper for model with extends', () => {
            // Declaration
            const model:GeneratorModel.Model = {
                name: 'name',
                description: 'description',
                extends: [
                    'type1',
                    'type2',
                ],
            }
            // Execution
            const result = GeneratorWriter.convertModel(model)
            // Assertion
            const expected = [
                '// description',
                'export interface name extends type1, type2 {',
                '}'
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })

    // convertModelProperty //

    describe('convertModelProperty', () => {

        test('when the property is required', () => {
            // Declaration
            const property:GeneratorModel.ModelProperty = {
                name: 'property',
                required: true,
                type: 'type'
            }
            // Execution
            const result = GeneratorWriter.convertModelProperty(property)
            // Assertion
            const expected = '    property: type'
            expect(result).toEqual(expected)
        })

        test('when the property is not required', () => {
            // Declaration
            const property:GeneratorModel.ModelProperty = {
                name: 'property',
                required: false,
                type: 'type'
            }
            // Execution
            const result = GeneratorWriter.convertModelProperty(property)
            // Assertion
            const expected = '    property?: type'
            expect(result).toEqual(expected)
        })
    })

    // writeService //

    describe('writeService', () => {

        let stubConvertModelImport:jest.SpyInstance
        let stubConvertEndpoint:jest.SpyInstance
        let stubConvertStructure:jest.SpyInstance

        beforeEach(() => {
            stubConvertModelImport = jest.spyOn(GeneratorWriter, 'convertModelImport')
            stubConvertEndpoint = jest.spyOn(GeneratorWriter, 'convertEndpoint')
            stubConvertStructure = jest.spyOn(GeneratorWriter, 'convertStructure')
            stubConvertModelImport.mockImplementation(() => '')
            stubConvertEndpoint.mockImplementation(() => [])
            stubConvertStructure.mockImplementation(() => '')
        })

        afterEach(() => {
            stubConvertModelImport.mockRestore()
            stubConvertEndpoint.mockRestore()
            stubConvertStructure.mockRestore()
        })

        test('properly calls subsequent methods', () => {
            // Declaration
            const file = 'file'
            const models:GeneratorModel.Model[] = []
            const service:GeneratorModel.Service = {
                name: 'name',
                urlBase: 'urlBase',
                endpoints: [{ name: 'endpointName', description: 'endpointDescription', url: 'endpointUrl', method: 'GET' }],
                structure: []
            }
            // Execution
            const result = GeneratorWriter.writeService(file, models, service)
            // Assertion
            expect(stubConvertModelImport).toHaveBeenCalled()
            expect(stubConvertEndpoint).toHaveBeenCalled()
            expect(stubConvertStructure).toHaveBeenCalled()
            expect(stubFsWriteFileSync).toHaveBeenCalled()
        })
    })

    // convertModelImport //

    describe('convertModelImport', () => {

        test('properly build the import for givne models', () => {
            // Declaration
            const name:string = 'name'
            const models:GeneratorModel.Model[] = [
                { name: 'modelName1', description: '', properties: [] },
                { name: 'modelName2', description: '', properties: [] },
            ]
            // Execution
            const result = GeneratorWriter.convertModelImport(name, models)
            // Assertion
            const expected = [
                `import Service from '../service'`,
                'import {',
                '    modelName1,',
                '    modelName2,',
                `} from './name.model'`,
                ''
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })

    // convertEndpointComment //

    describe('convertEndpointComment', () => {

        test('basic GET endpoint without params', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            const endpoint:GeneratorModel.ServiceEndpoint = {
                name: 'endpointName',
                description: 'endpointDescription',
                url: 'endpointUrl',
                method: 'GET',
            }
            // Execution
            const result = GeneratorWriter.convertEndpointComment(service, endpoint)
            // Assertion
            const expected = [
                '/**',
                ' * GET endpointUrl',
                ' * endpointDescription',
                ' */',
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('basic GET endpoint with url params', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            const endpoint:GeneratorModel.ServiceEndpoint = {
                name: 'endpointName',
                description: 'endpointDescription',
                url: 'endpointUrl',
                method: 'GET',
                urlParams: [
                    { name: 'urlParamName', type: 'urlParamType', required: true },
                ],
                queryParams: []
            }
            // Execution
            const result = GeneratorWriter.convertEndpointComment(service, endpoint)
            // Assertion
            const expected = [
                '/**',
                ' * GET endpointUrl',
                ' * endpointDescription',
                ' * @param {urlParamType} urlParamName - URL parameter',
                ' */',
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('basic GET endpoint with query params', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            const endpoint:GeneratorModel.ServiceEndpoint = {
                name: 'endpointName',
                description: 'endpointDescription',
                url: 'endpointUrl',
                method: 'GET',
                urlParams: [],
                queryParams: [
                    { name: 'queryParamName1', type: 'queryParamType1', required: true },
                    { name: 'queryParamName2', type: 'queryParamType2', required: false },
                ]
            }
            // Execution
            const result = GeneratorWriter.convertEndpointComment(service, endpoint)
            // Assertion
            const expected = [
                '/**',
                ' * GET endpointUrl',
                ' * endpointDescription',
                ` * @param {'queryParamName1':queryParamType1,'queryParamName2'?:queryParamType2} query - Query parameters`,
                ' */',
            ].join('\n')
            expect(result).toEqual(expected)
        })
    });

    // convertEndpoint //

    describe('convertEndpoint', () => {

        test('basic GET endpoint without params', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            const endpoint:GeneratorModel.ServiceEndpoint = {
                name: 'endpointName',
                description: 'endpointDescription',
                url: 'endpointUrl',
                method: 'GET',
            }
            // Execution
            const result = GeneratorWriter.convertEndpoint(service, endpoint)
            // Assertion
            const expected = [
                'export const endpointName = async () => {',
                '    const url = `endpointUrl`',
                '    const options = {',
                `        method: 'GET',`,
                '    }',
                '    const response = await ServiceNameService.fetch(url, options)',
                '    const responseData = await response.json()',
                '    return responseData',
                `}`,
                ''
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('basic DELETE endpoint with URL params', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            const endpoint:GeneratorModel.ServiceEndpoint = {
                name: 'endpointName',
                description: 'endpointDescription',
                url: 'endpointUrl',
                method: 'DELETE',
                urlParams: [
                    { name: 'id', required: true, type: 'string' },
                    { name: 'value', required: true, type: 'boolean' },
                ]
            }
            // Execution
            const result = GeneratorWriter.convertEndpoint(service, endpoint)
            // Assertion
            const expected = [
                'export const endpointName = async (id:string, value:boolean) => {',
                '    const url = `endpointUrl`',
                '    const options = {',
                `        method: 'DELETE',`,
                '    }',
                '    const response = await ServiceNameService.fetch(url, options)',
                '    const responseData = await response.json()',
                '    return responseData',
                `}`,
                ''
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('basic POST endpoint with payload, query params & type any', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            const endpoint:GeneratorModel.ServiceEndpoint = {
                name: 'endpointName',
                description: 'endpointDescription',
                url: 'endpointUrl',
                method: 'POST',
                payloadType: 'any',
                queryParams: [
                    { name: 'id', required: true, type: 'string' },
                    { name: 'value', required: false, type: 'boolean' },
                ]
            }
            // Execution
            const result = GeneratorWriter.convertEndpoint(service, endpoint)
            // Assertion
            const expected = [
                `export const endpointName = async (query:{'id':string, 'value'?:boolean}, payload:any) => {`,
                '    const url = `endpointUrl?id=${encodeURIComponent(String(query[\'id\']))}&value=${encodeURIComponent(String(query[\'value\']))}`',
                '    const options = {',
                `        method: 'POST',`,
                `        body: payload,`,
                '    }',
                '    const response = await ServiceNameService.fetch(url, options)',
                '    const responseData = await response.json()',
                '    return responseData',
                `}`,
                ''
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('basic PUT endpoint with payload type string', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            const endpoint:GeneratorModel.ServiceEndpoint = {
                name: 'endpointName',
                description: 'endpointDescription',
                url: 'endpointUrl',
                method: 'PUT',
                payloadType: 'type',
            }
            // Execution
            const result = GeneratorWriter.convertEndpoint(service, endpoint)
            // Assertion
            const expected = [
                'export const endpointName = async (payload:type) => {',
                '    const url = `endpointUrl`',
                '    const options = {',
                `        method: 'PUT',`,
                `        body: JSON.stringify(payload),`,
                '    }',
                '    const response = await ServiceNameService.fetch(url, options)',
                '    const responseData = await response.json()',
                '    return responseData',
                `}`,
                ''
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })

    // convertStructure //

    describe('convertStructure', () => {

        let stubConvertStructureNodes:jest.SpyInstance

        beforeEach(() => {
            stubConvertStructureNodes = jest.spyOn(GeneratorWriter, 'convertStructureNodes')
            stubConvertStructureNodes.mockImplementation(() => 'structureNodes')
        })

        afterEach(() => {
            stubConvertStructureNodes.mockRestore()
        })

        test('returns the correct service definition', () => {
            // Declaration
            const service:GeneratorModel.Service = {
                name: 'serviceName',
                urlBase: 'serviceUrlBase',
                endpoints: [],
                structure: [],
            }
            // Execution
            const result = GeneratorWriter.convertStructure(service)
            // Assertion
            const expected = [
                `const ServiceNameService = new Service('serviceUrlBase', {`,
                'structureNodes',
                '})',
                ``,
                'export default ServiceNameService',
                '',
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })

    // convertStructureNodes //

    describe('convertStructureNodes', () => {

        const service:GeneratorModel.Service = {
            name: 'serviceName',
            urlBase: 'serviceUrlBase',
            endpoints: [],
            structure: [],
        }

        let stubConvertStructureNode:jest.SpyInstance

        beforeEach(() => {
            stubConvertStructureNode = jest.spyOn(GeneratorWriter, 'convertStructureNode')
            stubConvertStructureNode.mockImplementation((depth, node) => `${depth} ${node.name}`)
        })

        afterEach(() => {
            stubConvertStructureNode.mockRestore()
        })

        test('returns the correct node definition', () => {
            // Declaration
            const depth = 2
            const nodes:GeneratorModel.ServiceNode[] = [
                { id: 'node1', name: 'node1', nodes: [] },
                { id: 'node2', name: 'node2', nodes: [] },
            ]
            // Execution
            const result = GeneratorWriter.convertStructureNodes(service, depth, nodes)
            // Assertion
            const expected = [
                `2 node1`,
                '2 node2',
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })

    // convertStructureNode //

    describe('convertStructureNode', () => {

        const service:GeneratorModel.Service = {
            name: 'serviceName',
            urlBase: 'serviceUrlBase',
            endpoints: [],
            structure: [],
        }

        test('when the node is a leaf with no endpoints', () => {
            // Declaration
            const depth = 2
            const node:GeneratorModel.ServiceNode = {
                id: 'node',
                name: 'node',
                nodes: []
            }
            // Execution
            const result = GeneratorWriter.convertStructureNode(service, depth, node)
            // Assertion
            const expected = [
                `        'node': {`,
                '        },',
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('when the node is a leaf with all endpoints', () => {
            // Declaration
            const depth = 2
            const node:GeneratorModel.ServiceNode = {
                id: 'node',
                name: 'node',
                post: 'nodePost',
                get: 'nodeGet',
                put: 'nodePut',
                delete: 'nodeDelete',
                nodes: []
            }
            // Execution
            const result = GeneratorWriter.convertStructureNode(service, depth, node)
            // Assertion
            const expected = [
                `        'node': {`,
                `            post: nodePost,`,
                `            get: nodeGet,`,
                `            put: nodePut,`,
                `            delete: nodeDelete,`,
                '        },',
            ].join('\n')
            expect(result).toEqual(expected)
        })

        test('when the node is a parent', () => {
            // Declaration
            const depth = 2
            const node:GeneratorModel.ServiceNode = {
                id: 'parent',
                name: 'parent',
                nodes: [{
                    id: 'child',
                    name: 'child',
                    nodes: []
                }]
            }
            // Execution
            const result = GeneratorWriter.convertStructureNode(service, depth, node)
            // Assertion
            const expected = [
                `        'parent': {`,
                `            'child': {`,
                `            },`,
                '        },',
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })

    // writeIndex //

    describe('writeIndex', () => {

        let stubConvertIndex:jest.SpyInstance

        beforeEach(() => {
            stubConvertIndex = jest.spyOn(GeneratorWriter, 'convertIndex')
            stubConvertIndex.mockImplementation(() => '')
        })

        afterEach(() => {
            stubConvertIndex.mockRestore()
        })

        test('properly calls subsequent methods', () => {
            // Declaration
            const file = 'file'
            const name = 'name'
            // Execution
            const result = GeneratorWriter.writeIndex(file, name)
            // Assertion
            expect(stubConvertIndex).toHaveBeenCalled()
            expect(stubFsWriteFileSync).toHaveBeenCalled()
        })
    })

    // convertIndex //

    describe('convertIndex', () => {

        test('build the proper index content', () => {
            // Declaration
            const name = 'name'
            // Execution
            const result = GeneratorWriter.convertIndex(name)
            // Assertion
            const expected = [
                `import Service from './name.service'`,
                `import * as Model from './name.model'`,
                '',
                `export default {`,
                '    Model,',
                '    Service,',
                '}',
                '',
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })

    // writeGlobalIndex //

    describe('writeGlobalIndex', () => {

        let stubConvertGlobalIndex:jest.SpyInstance

        beforeEach(() => {
            stubConvertGlobalIndex = jest.spyOn(GeneratorWriter, 'convertGlobalIndex')
            stubConvertGlobalIndex.mockImplementation(() => '')
        })

        afterEach(() => {
            stubConvertGlobalIndex.mockRestore()
        })

        test('properly calls subsequent methods', () => {
            // Declaration
            const file = 'file'
            const services:string[] = []
            // Execution
            const result = GeneratorWriter.writeGlobalIndex(file, services)
            // Assertion
            expect(stubConvertGlobalIndex).toHaveBeenCalled()
            expect(stubFsWriteFileSync).toHaveBeenCalled()
        })
    })

    // convertGlobalIndex //

    describe('convertGlobalIndex', () => {

        test('build the proper index content', () => {
            // Declaration
            const services = ['service1', 'service2']
            // Execution
            const result = GeneratorWriter.convertGlobalIndex(services)
            // Assertion
            const expected = [
                `import Service1 from './services/service1'`,
                `import Service2 from './services/service2'`,
                '',
                `export const Service1Service = Service1.Service`,
                `export const Service2Service = Service2.Service`,
                '',
                `export const Service1Model = Service1.Model`,
                `export const Service2Model = Service2.Model`,
                '',
                `export default {`,
                '    Service1,',
                '    Service2,',
                '}',
                '',
            ].join('\n')
            expect(result).toEqual(expected)
        })
    })
})
