# API of StreamFingate

```javascript

/**
 * validate stream address is valid or not.
 *
 * @static
 * @param {string} address stream address
 * @returns {boolean} return true if valid
 * @memberof StreamFingate
 */
static isValidAddress(address: string): boolean;

/**
 * validate stream secret is valid or not
 *
 * @static
 * @param {string} secret stream secret
 * @returns {boolean} return true if valid
 * @memberof StreamFingate
 */
static isValidSecret(secret: string): boolean;

/**
 * retrive address with secret
 *
 * @static
 * @param {string} secret stream secret
 * @returns {(string | null)} return stream address if secret is valid, otherwise return null
 * @memberof StreamFingate
 */
static getAddress(secret: string): string | null;

/**
 * init instance of _remote
 *
 * @returns {StreamFingate}
 * @memberof StreamFingate
 */
init(): StreamFingate;

/**
 * connect to stream network
 *
 * @returns {StreamFingate}
 * @memberof StreamFingate
 */
connect(): StreamFingate;

/**
 * disconnect from stream network
 *
 * @returns {StreamFingate}
 * @memberof StreamFingate
 */
disconnect(): StreamFingate;

/**
 * request balance of STM
 *
 * @param {string} address
 * @returns {Promise<string>}
 * @memberof StreamFingate
 */
getBalance(address: string): Promise<string>;

/**
 * transfer token to address of stream fingate
 *
 * @param {string} secret stream secret
 * @param {string} destination address of stream fingate
 * @param {string} value transfer amount
 * @param {IMemo} memo transfer memo
 * @returns {Promise<string>} resolve hash if success
 * @memberof StreamFingate
 */
transfer(secret: string, destination: string, value: string, memo: IMemo): Promise<string>;

```
