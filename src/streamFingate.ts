
import BigNumber from "bignumber.js";
import * as stmWallet from "jcc_wallet/lib/stm";
import { Remote } from "stm-lib";
import IMemo from "./model/memo";
import IServer from "./model/server";
import { isValidAmount, isValidMemo, isValidStreamAddress, isValidStreamSecret, validate } from "./validator";

/**
 * Toolkit of Stream
 *
 * @class StreamFingate
 */
export default class StreamFingate {

    public readonly version = "0.1.1";

    private _remote: Remote = null;

    private _trace: boolean = false;

    private _trusted: boolean = true;

    private _localSign: boolean = true;

    private _ping: number = 10;

    private _server: IServer = null;

    private _currency: string = "STM";

    private _native = "STM";

    private _decimals: number = 6;

    constructor(server: IServer) {
        this._server = server;
    }

    public set trace(v: boolean) {
        this._trace = v;
    }

    public set trusted(v: boolean) {
        this._trusted = v;
    }

    public set localSign(v: boolean) {
        this._localSign = v;
    }

    public set ping(v: number) {
        this._ping = v;
    }

    public set currency(v: string) {
        this._currency = v;
    }

    public get remote(): Remote {
        return this._remote;
    }

    /**
     * validate stream address is valid or not.
     *
     * @static
     * @param {string} address stream address
     * @returns {boolean} return true if valid
     * @memberof StreamFingate
     */
    public static isValidAddress(address: string): boolean {
        return stmWallet.isValidAddress(address);
    }

    /**
     * validate stream secret is valid or not
     *
     * @static
     * @param {string} secret stream secret
     * @returns {boolean} return true if valid
     * @memberof StreamFingate
     */
    public static isValidSecret(secret: string): boolean {
        return stmWallet.isValidSecret(secret);
    }

    /**
     * retrive address with secret
     *
     * @static
     * @param {string} secret stream secret
     * @returns {(string | null)} return stream address if secret is valid, otherwise return null
     * @memberof StreamFingate
     */
    public static getAddress(secret: string): string | null {
        return stmWallet.getAddress(secret);
    }

    /**
     * init instance of _remote
     *
     * @returns {StreamFingate}
     * @memberof StreamFingate
     */
    public init(): StreamFingate {
        const _server = {
            local_signing: this._localSign,
            ping: this._ping,
            servers: [this._server],
            trace: this._trace,
            trusted: this._trusted
        };
        this._remote = new Remote(_server, true);
        return this;
    }

    /**
     * connect to stream network
     *
     * @returns {StreamFingate}
     * @memberof StreamFingate
     */
    public connect(): StreamFingate {
        this._remote.connect();
        return this;
    }

    /**
     * disconnect from stream network
     *
     * @returns {StreamFingate}
     * @memberof StreamFingate
     */
    public disconnect(): StreamFingate {
        this._remote.disconnect();
        return this;
    }

    /**
     * request balance of STM
     *
     * @param {string} address
     * @returns {Promise<string>}
     * @memberof StreamFingate
     */
    public getBalance(address: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._remote.requestAccountInfo({
                account: address
            }, (err, res) => {
                if (err) {
                    return reject(err);
                }
                const bn = new BigNumber(res.account_data.Balance);
                const balance = bn.dividedBy(10 ** this._decimals);
                return resolve(balance.toString(10));
            });
        });
    }

    /**
     * transfer token to address of stream fingate
     *
     * @param {string} secret stream secret
     * @param {string} destination address of stream fingate
     * @param {number} value transfer amount
     * @param {IMemo} memo transfer memo
     * @returns {Promise<string>} resolve hash if success
     * @memberof StreamFingate
     */
    @validate
    public async transfer(@isValidStreamSecret secret: string, @isValidStreamAddress destination: string, @isValidAmount value: number, @isValidMemo memo: IMemo): Promise<string> {
        return new Promise((resolve, reject) => {
            const address = StreamFingate.getAddress(secret);
            let amount: any;
            if (this._currency === this._native) {
                amount = new BigNumber(value).multipliedBy(10 ** this._decimals);
                amount = amount.toString(10);
            } else {
                return reject(new Error("Only support transfer STM for now."));
            }
            this._remote.setSecret(address, secret);
            const transaction = this._remote.createTransaction("Payment", {
                account: address,
                amount,
                destination
            });
            transaction.addMemo(encodeURI("memo"), encodeURI(JSON.stringify(memo)));
            transaction.lastLedger(this._remote._ledger_current_index + 3);
            transaction.submit((error, raw) => {
                if (error) {
                    return reject(error);
                }
                if (raw.engine_result === "tesSUCCESS") {
                    return resolve(raw.tx_json.hash);
                }
                return reject(new Error(raw.engine_result_message));
            });
        });
    }
}
