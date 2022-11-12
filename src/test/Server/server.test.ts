import { Server } from '../../app/Server/Server'
import { LoginHandler } from '../../app/Handlers/LoginHandler'
import { DataHandler } from '../../app/Handlers/DataHandler'
import { Authorizer } from '../../app/Authorization/Authorizer'
import { UsersDBAccess } from '../../app/Data/UsersDBAccess'

const reqMock = {
    url: ''
};
const resMock = {
    end: jest.fn()
};
const listenMock = {
    listen: jest.fn()
};

jest.mock('../../app/Handlers/LoginHandler')
jest.mock('../../app/Handlers/DataHandler')
jest.mock('../../app/Authorization/Authorizer')

jest.mock('http', () => ({
    createServer:(cb: any) => {
        cb(reqMock, resMock)
        return listenMock;
    }
}))

describe('Server test suite', () => {
    it('Should create server at port 8080', () => {
        new Server().startServer();

        expect(listenMock.listen).toBeCalledWith(8080);
        expect(resMock.end).toBeCalled();
    })

    it('should handle login request', () => {
        reqMock.url = 'http://localhost:8080/login';
        const handleRequestSpy = jest.spyOn(LoginHandler.prototype, 'handleRequest')
        new Server().startServer();

        expect(handleRequestSpy).toBeCalled();
        expect(LoginHandler).toBeCalledWith(reqMock, resMock, expect.any(Authorizer))
    })

    it('should handle data request', () => {
        reqMock.url = 'http://localhost:8080/users';
        const handleRequestSpy = jest.spyOn(DataHandler.prototype, 'handleRequest')
        new Server().startServer();

        expect(handleRequestSpy).toBeCalled();
        expect(DataHandler).toBeCalledWith(reqMock, resMock, expect.any(Authorizer), expect.any(UsersDBAccess))
    })
});