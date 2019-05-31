<!-- markdownlint-disable MD024 -->

# jcc-stream-utils

Toolkit of crossing chain from [Stream chain](https://labs.stream/cn/) to [SWTC chain](http://www.swtc.top/#/)

![npm](https://img.shields.io/npm/v/jcc-stream-utils.svg)
[![Build Status](https://travis-ci.com/JCCDex/jcc-stream-utils.svg?branch=master)](https://travis-ci.com/JCCDex/jcc-stream-utils)
[![Coverage Status](https://coveralls.io/repos/github/JCCDex/jcc-stream-utils/badge.svg?branch=master)](https://coveralls.io/github/JCCDex/jcc-stream-utils?branch=master)
[![Dependencies](https://img.shields.io/david/JCCDex/jcc-stream-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-stream-utils)
[![DevDependencies](https://img.shields.io/david/dev/JCCDex/jcc-stream-utils.svg?style=flat-square)](https://david-dm.org/JCCDex/jcc-stream-utils?type=dev)
[![npm downloads](https://img.shields.io/npm/dm/jcc-stream-utils.svg)](http://npm-stat.com/charts.html?package=jcc-stream-utils)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Description

Transfer token automatically from [Stream](https://labs.stream/cn/) chain to [SWTC](http://www.swtc.top/#/) chain. Support STM tokens.

e.g. you transfer 1 `STM` to [Stream Fingate](https://graph.labs.stream/#/graph/vn4K541zh3vNHHJJaos2Poc4z3RiMHLHcK) from your stream address if success, the contract will automatically transfer 1 `JSTM` to your swtc address from [jingtum fingate](https://explorec9d536e.jccdex.cn/#/wallet/?wallet=japp9xxt2VHpRwHsoa76GWoQj1VdsjcZQJ) in a few minutes.

## Usage

```javascript
// demo
import StreamFingate from "jcc-stream-utils";

// This is a test websocket server. Don't use it in production environment.
const testServer = "sa.labs.stream";

const instance = new StreamFingate({
    host: testServer,
    port: 443,
    secure: true
});

let testSecret = "vaFtuK2skLZUCcqHvsFk2BMKpzQmJbQsXa";

// Don't change it. The fingate address is it for now.
let destination = "vn4K541zh3vNHHJJaos2Poc4z3RiMHLHcK";

let testDemo = {
    jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
}

try {
    instance.init()
        .connect()
    let hash = await instance.transfer(testSecret, destination, 1, testDemo);
    console.log(hash);
} catch (error) {
    console.log(error);
} finally {
    instance.disconnect();
}
```
