const StreamFingate = require("../lib").default;
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const Transaction = require("stm-lib").Transaction;
const sandbox = sinon.createSandbox();

const testAddress = "vaFtuK2skLZUCcqHvsFk2BMKpzQmJbQsXa";
const testSecret = "sp5KqpgwuHo3ejF5Bf9kDSJPivEYV";
const testServer = {
    host: "sa.labs.stream",
    port: 443,
    secure: true
}

describe("test stream fingate", function () {
    describe('test constructor', function () {
        it("create successfully", function () {
            let inst = new StreamFingate(testServer);
            expect(inst._server).to.deep.equal(testServer);
        });
    })

    describe('test setter and getter', function () {
        let inst;
        before(() => {
            inst = new StreamFingate(testServer);
        })
        it('test property', function () {
            expect(inst._trace).to.equal(false);
            expect(inst._trusted).to.equal(true);
            expect(inst._ping).to.equal(10);
            expect(inst._localSign).to.equal(true);
            expect(inst._currency).to.equal("STM");
            expect(inst._native).to.equal("STM");
            expect(inst._decimals).to.equal(6);
            inst.trace = true;
            inst.trusted = false;
            inst.localSign = false;
            inst.currency = "STREAM";
            inst.ping = 11;
            expect(inst._trace).to.equal(true);
            expect(inst._trusted).to.equal(false);
            expect(inst._ping).to.equal(11);
            expect(inst._localSign).to.equal(false);
            expect(inst._currency).to.equal("STREAM");
        })
    })

    describe('test isValidAddress', function () {

        it('return true if the stream address is valid', function () {
            let valid = StreamFingate.isValidAddress(testAddress);
            expect(valid).to.equal(true);
        })

        it('return false if the stream address is invalid', function () {
            let valid = StreamFingate.isValidAddress(null);
            expect(valid).to.equal(false);
        })
    })

    describe('test isValidSecret', function () {

        it('return true if the stream secret is valid', function () {
            let valid = StreamFingate.isValidSecret(testSecret);
            expect(valid).to.equal(true);
        })

        it('return false if the stream secret is invalid', function () {
            let valid = StreamFingate.isValidSecret(null);
            expect(valid).to.equal(false);
        })
    })

    describe('test getAddress', function () {

        it('return right address if the stream secret is valid', function () {
            let address = StreamFingate.getAddress(testSecret);
            expect(address).to.equal(testAddress);
        })

        it('return null if the stream secret is invalid', function () {
            let address = StreamFingate.getAddress(testSecret.substring(1));
            expect(address).to.equal(null);
        })
    })

    describe('test init', function () {
        it("create instance correctly", function () {
            let inst = new StreamFingate(testServer);
            expect(inst.init() instanceof StreamFingate).to.true;
            expect(inst.remote.local_signing).to.true;
            expect(inst.remote.trace).to.false;
            expect(inst.remote.trusted).to.true;
        });
    })

    describe("test connect", function () {
        it("should call once", function () {
            let inst = new StreamFingate(testServer);
            inst.init();
            let spy = sandbox.stub(inst.remote, "connect");
            inst.connect();
            expect(spy.calledOnce).to.true;
        })
    })

    describe("test disconnect", function () {
        it("should call once", function () {
            let inst = new StreamFingate(testServer);
            inst.init();
            let spy = sandbox.stub(inst.remote, "disconnect");
            inst.disconnect();
            expect(spy.calledOnce).to.true;
        });
    });

    describe("test transfer", function () {
        let inst;
        before(() => {
            inst = new StreamFingate(testServer);
            inst.init();
        })
        it("throw error if the secret is invalid", function () {
            expect(() => inst.transfer("111", "111", 1, {
                jtaddress: "111"
            })).throws("111 is invalid stream secret.")
        })

        it("throw error if the destination is invalid", function () {
            expect(() => inst.transfer(testSecret, "111", 1, {
                jtaddress: "111"
            })).throws("111 is invalid stream address.")
        })

        it("throw error if the amount is invalid", function () {
            expect(() => inst.transfer(testSecret, testAddress, 0, {
                jtaddress: "111"
            })).throws("0 is invalid amount.")
        })

        it("throw error if the amount is invalid", function () {
            expect(() => inst.transfer(testSecret, testAddress, 1, {
                jtaddress: "111"
            })).throws("111 is invalid jingtum address in memo.")
        })

        it("throw error if the transfer token is not STM", function (done) {
            inst.currency = "BWT";
            inst.transfer(testSecret, testAddress, 1, {
                jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
            }).catch(error => {
                expect(error.message).to.equal("Only support transfer STM for now.");
                done();
            })
        })

        it("throw error if transfer failed", function (done) {
            inst.currency = "STM";
            let stub = sandbox.stub(Transaction.prototype, "submit");
            stub.yields(new Error("connect error"), null);
            inst.transfer(testSecret, "vn4K541zh3vNHHJJaos2Poc4z3RiMHLHcK", 0.1, {
                jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
            }).catch(error => {
                stub.restore();
                expect(error.message).to.equal("connect error");
                done();
                stub.restore();
            });
        })

        it("transfer success", function (done) {
            let stub = sandbox.stub(Transaction.prototype, "submit");
            stub.yields(null, {
                tx_json: {
                    hash: "123456"
                }
            });
            let s = sandbox.stub(inst.remote, "setSecret");
            inst.remote._ledger_current_index = 0;
            let s1 = sandbox.spy(inst.remote, "createTransaction");
            let s2 = sandbox.stub(Transaction.prototype, "lastLedger");
            let s3 = sandbox.spy(Transaction.prototype, "addMemo");
            inst.transfer(testSecret, "vn4K541zh3vNHHJJaos2Poc4z3RiMHLHcK", 0.1, {
                jtaddress: "jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH"
            }).then(hash => {
                let args = s.getCall(0).args;
                let args1 = s1.getCall(0).args;
                let args2 = s3.getCall(0).args;
                expect(args[0]).to.equal(testAddress);
                expect(args[1]).to.equal(testSecret);
                expect(args1[0]).to.equal("Payment");
                expect(args1[1]).to.deep.equal({
                    account: testAddress,
                    amount: "100000",
                    destination: "vn4K541zh3vNHHJJaos2Poc4z3RiMHLHcK"
                });
                expect(s2.getCall(0).args[0]).to.equal(3);
                expect(args2[0]).to.equal("memo");
                expect(args2[1]).to.equal("%7B%22jtaddress%22:%22jpgWGpfHz8GxqUjz5nb6ej8eZJQtiF6KhH%22%7D");
                expect(hash).to.equal("123456");
                done();
            });
        })
    })
})