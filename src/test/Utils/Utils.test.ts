import { IncomingMessage } from 'http'
import { Utils } from '../../app/Utils/Utils'

describe('Utils test suite', () => {
    // Jest unit testing hooks 
    beforeEach(() => {
        console.log("before each")
    })

    it('tests getRequestPath valid request', () => {
        const url = 'http://localhost:8080/login'
        const request = {
            url
        } as IncomingMessage

        const resultPath = Utils.getRequestBasePath(request)
        expect(resultPath).toBe('login')
    })

    it('tests getRequestPath with no path name', () => {
        const url = 'http://localhost:8080'
        const request = {
            url
        } as IncomingMessage

        const resultPath = Utils.getRequestBasePath(request)
        expect(resultPath).toBeFalsy()
    })

    it('tests getRequestPath with no url', () => {
        const url = ''
        const request = {
            url
        } as IncomingMessage

        const resultPath = Utils.getRequestBasePath(request)
        expect(resultPath).toBeFalsy()
    })
})