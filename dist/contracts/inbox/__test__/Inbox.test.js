"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ganache_core_1 = __importDefault(require("ganache-core"));
const web3_1 = __importDefault(require("web3"));
const compile_1 = require("../../../compile");
const web3 = new web3_1.default(ganache_core_1.default.provider());
const inboxContract = (0, compile_1.compileContract)("Inbox");
const setUpContractWithAccounts = async (baseContract) => {
    const accounts = await web3.eth.getAccounts();
    return {
        accounts,
        deployedContract: (await new web3.eth.Contract(baseContract.abi)
            .deploy({
            data: baseContract?.evm?.bytecode.object,
            arguments: ["Sup yo!"],
        })
            .send({ from: accounts[0], gas: 1000000 })),
    };
};
describe("Inbox contract", () => {
    it("Deploys a contract", async () => {
        const { deployedContract } = await setUpContractWithAccounts(inboxContract);
        (0, chai_1.expect)(deployedContract.options.address).to.be.a("string");
        (0, chai_1.expect)(deployedContract.options.address).to.have.lengthOf(42);
    });
    it("Has a default message", async () => {
        const { deployedContract } = await setUpContractWithAccounts(inboxContract);
        const initialMessage = await deployedContract.methods.message().call();
        (0, chai_1.expect)(initialMessage).to.be.a("string");
        (0, chai_1.expect)(initialMessage).to.equal("Sup yo!");
    });
    it("Can change message and return transaction hash", async () => {
        const { deployedContract, accounts } = await setUpContractWithAccounts(inboxContract);
        const { transactionHash } = await deployedContract.methods
            .setMessage("Ok bye")
            .send({ from: accounts[0] });
        const changedMessage = await deployedContract.methods.message().call();
        (0, chai_1.expect)(transactionHash).to.be.a("string");
        (0, chai_1.expect)(transactionHash).to.lengthOf(66);
        (0, chai_1.expect)(changedMessage).to.be.a("string");
        (0, chai_1.expect)(changedMessage).to.equal("Ok bye");
    });
});
//# sourceMappingURL=Inbox.test.js.map