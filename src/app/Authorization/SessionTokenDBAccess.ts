import { SessionToken } from '../Models/ServerModels';
const Nedb = require('nedb')

export class SessionTokenDBAccess {

    private nedb: typeof Nedb;

    constructor(nedb = new Nedb('databases/sessionToken.db')) {
        this.nedb = nedb;
        this.nedb.loadDatabase();
    }

    public async storeSessionToken(token: SessionToken): Promise<void> {
        return new Promise((resolve, reject) => {
            this.nedb.insert(token, (err: Error | null) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        });
    }

    public async getToken(tokenId: string): Promise<SessionToken | undefined> {
        return new Promise((resolve, reject) => {
            this.nedb.find({ tokenId: tokenId }, (err: Error, docs: any[]) => {
                if (err) {
                    reject(err)
                } else {
                    if (docs.length == 0) {
                        resolve(undefined)
                    } else {
                        resolve(docs[0]);
                    }
                }
            })
        });
    }

    public async deleteToken(tokenId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.nedb.remove({ tokenId: tokenId }, {}, (err: Error | null, numRemoved: number) => {
                if (err) {
                    reject(err)
                } else {
                    if (numRemoved == 0) {
                        reject(new Error('Session token not deleted'))
                    } else {
                        resolve();
                    }
                }
            })
        });
    }
}
