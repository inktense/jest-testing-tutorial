import { isReadable } from 'stream'
import { Utils } from '../app/Utils'

describe('Utils test suite', () => {
    // Jest unit testing hooks 
    beforeEach(() => {
        console.log("before each")
    })

    it('parse simple URL', () => {
        const parsedUrl = Utils.parseUrl('http://localhost:8080/login')

        expect(parsedUrl.href).toBe('http://localhost:8080/login')
        expect(parsedUrl.port).toBe('8080')
        expect(parsedUrl.protocol).toBe('http:')
        expect(parsedUrl.query).toEqual({})
    })

    it('parse URL with query', () => {
        const parsedUrl = Utils.parseUrl('http://localhost:8080/login?user=user&password=pass')
        const expectedQuery = {
            user: 'user',
            password: 'pass'
        }

        expect(parsedUrl.query).toEqual(expectedQuery)
    })

    it('invalid URL', () => {

        expect(() => {
            Utils.parseUrl('')
        }).toThrow('Empty URL')
    })

    it('invalid URL with try catch', () => {
        try {
            Utils.parseUrl('')
        } catch(error) {
            expect(error).toBeInstanceOf(Error)
            expect(error).toHaveProperty('message', 'Empty URL')
        }
    })
})