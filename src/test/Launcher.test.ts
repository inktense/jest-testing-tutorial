import { Launcher } from '../app/Launcher'
import { Server } from '../app/Server/Server'

jest.mock('../app/Server/Server')
jest.mock('../app/Server/Server', () => {
    return {
        Server: jest.fn(() => {
            return {
                startServer: () => {
                    console.log('Starting fake server')
                }
            }
        })
    }
})

describe('Launcher test suite', () => {
    const mockedServer = jest.mocked(Server)

    it('Should create server', () => {
        new Launcher();
        
        expect(mockedServer).toBeCalled();
    })

    it('Should launch app', () => {
        const launchAppMock = jest.fn();
        Launcher.prototype.launchApp = launchAppMock;
        new Launcher().launchApp();

        expect(launchAppMock).toBeCalled();
    })
});