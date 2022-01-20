"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ganache_core_1 = __importDefault(require("ganache-core"));
const web3_1 = __importDefault(require("web3"));
const compile_1 = require("../../compile");
const web3 = new web3_1.default(ganache_core_1.default.provider());
const crowdfundingContract = (0, compile_1.compileContract)("Crowdfunding");
const setUpContractWithAccounts = async (baseContract) => {
    const accounts = await web3.eth.getAccounts();
    return {
        accounts,
        organizerAddress: accounts[0],
        participatorsAddresses: accounts.slice(1),
        deployedContract: await new web3.eth.Contract(baseContract.abi)
            .deploy({
            data: baseContract?.evm?.bytecode.object,
        })
            .send({ from: accounts[0], gas: 2000000 }),
    };
};
describe("Crowdfunding contract", () => {
    it("Deploys a contract", async () => {
        const { deployedContract } = await setUpContractWithAccounts(crowdfundingContract["CrowdfundingCampaign"]);
        (0, chai_1.expect)(deployedContract.options.address).to.be.a("string");
        (0, chai_1.expect)(deployedContract.options.address).to.have.lengthOf(42);
    });
});
//# sourceMappingURL=CrowdfundingCampaign.test.js.map