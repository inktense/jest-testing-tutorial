import { UserCredentialsDbAccess } from '../app/Authorization/UserCredentialsDbAccess';
import { HTTP_CODES, SessionToken, UserCredentials } from '../app/Models/ServerModels';
import { Server } from '../app/Server/Server'
const axios = require('axios').default || require('axios')

axios.default.defaults.validateStatus = function () {
    return true;
}
//jest.mock("axios");
const serverUrl = 'http://localhost:8080';
const itestUserCredentials: UserCredentials = {
    accessRights: [1, 2, 3],
    password: 'iTestPassword',
    username: 'iTestUser'
}

async function serverReachable(): Promise<boolean> {
    try {
        console.log(serverUrl)
        const response = await axios.default.get(serverUrl)
    }catch(error) {
        console.log('Server not reachable ', error)
        return false;
    }
    console.log('Server is reachable')
    return true;
}

describe('Server test suite', () => {
    // Not usable in Jest, we cannot have an async describe
    // const serverReachable = await serverReachable()? test : test.skip;
    let userCredentialsDBAccess: UserCredentialsDbAccess;
    let sessionToken: SessionToken;
    
    beforeAll(() => {
        userCredentialsDBAccess = new UserCredentialsDbAccess();
    })

    it('server reachable', async () => {
        const response = await axios.default.options(serverUrl);

        expect(response.status).toBe(HTTP_CODES.OK);
    });

    it('should put credentials inside database', async () => {
        await userCredentialsDBAccess.putUserCredential(itestUserCredentials);
    });

    it('reject invalid credentials', async () => {
        const response = await axios.default.post(
            (serverUrl + '/login'),
            {
                "username": "someWrongCred",
                "password": "someWrongCred"
            }
        );

        expect(response.status).toBe(HTTP_CODES.NOT_fOUND);
    });

    it('login successful with correct credentials', async () => {
        const response = await axios.default.post(
            (serverUrl + '/login'),
            {
                "username": itestUserCredentials.username,
                "password": itestUserCredentials.password
            }
        );

        console.log('response => ', response)

        expect(response.status).toBe(HTTP_CODES.CREATED);
        sessionToken = response.data;
    });

    it('Query data', async () => {
        const response = await axios.default.get(
            (serverUrl + '/users?name=some'), {
            headers: {
                Authorization: sessionToken.tokenId
            }
        }
        );

        expect(response.status).toBe(HTTP_CODES.OK);
    });

    it('Query data with invalid token', async () => {
        const response = await axios.default.get(
            (serverUrl + '/users?name=some'), {
            headers: {
                Authorization: sessionToken.tokenId + 'someStuff'
            }
        }
        );

        expect(response.status).toBe(HTTP_CODES.UNAUTHORIZED);
    });
})