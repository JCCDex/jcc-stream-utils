import * as jtWallet from "jcc_wallet/lib/jingtum";
import * as stmWallet from "jcc_wallet/lib/stm";

const router = Symbol();
const checkStreamAddressKey = Symbol();
const checkMemoKey = Symbol();
const checkStreamSecretKey = Symbol();
const checkAmountKey = Symbol();

const setTarget = (target: any, name: string, index: number, key: symbol) => {
    target[router] = target[router] || {};
    target[router][name] = target[router][name] || {};
    target[router][name].params = target[router][name].params || [];
    target[router][name].params[index] = key;
};

export const isValidStreamAddress = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkStreamAddressKey);
};

export const isValidStreamSecret = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkStreamSecretKey);
};

export const isValidMemo = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkMemoKey);
};

export const isValidAmount = (target: any, name: string, index: number) => {
    setTarget(target, name, index, checkAmountKey);
};

export const validate = (target: any, name: string, descriptor: PropertyDescriptor) => {
    const method = descriptor.value;

    descriptor.value = function () {
        const params = target[router][name].params;
        /* istanbul ignore else */
        if (Array.isArray(params)) {
            const length = params.length;
            for (let index = 0; index < length; index++) {
                const element = params[index];
                const value = arguments[index];
                switch (element) {
                    case checkStreamAddressKey:
                        if (!stmWallet.isValidAddress(value)) {
                            throw new Error(`${value} is invalid stream address.`);
                        }
                        break;
                    case checkStreamSecretKey:
                        if (!stmWallet.isValidSecret(value)) {
                            throw new Error(`${value} is invalid stream secret.`);
                        }
                        break;
                    case checkAmountKey:
                        if (Number.isNaN(value) || !Number.isFinite(value) || value <= 0) {
                            throw new Error(`${value} is invalid amount.`);
                        }
                        break;
                    case checkMemoKey:
                        if (!jtWallet.isValidAddress(value.jtaddress)) {
                            throw new Error(`${value.jtaddress} is invalid jingtum address in memo.`);
                        }
                        break;
                    /* istanbul ignore next */
                    default:
                        break;
                }
            }
        }
        return method.apply(this, arguments);
    };
};
