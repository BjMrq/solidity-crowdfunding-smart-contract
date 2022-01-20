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
const lotteryContract = (0, compile_1.compileContract)("Lottery");
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
describe("Lottery contract", () => {
    it("Deploys a contract", async () => {
        const { deployedContract } = await setUpContractWithAccounts(lotteryContract);
        (0, chai_1.expect)(deployedContract.options.address).to.be.a("string");
        (0, chai_1.expect)(deployedContract.options.address).to.have.lengthOf(42);
    });
    it("The creator is the organizer", async () => {
        const { deployedContract, organizerAddress } = await setUpContractWithAccounts(lotteryContract);
        const contractOrganizerAddress = await deployedContract.methods
            .organizerAddress()
            .call();
        (0, chai_1.expect)(contractOrganizerAddress).to.be.a("string");
        (0, chai_1.expect)(contractOrganizerAddress).to.have.lengthOf(42);
        (0, chai_1.expect)(contractOrganizerAddress).to.be.equal(organizerAddress);
    });
    it("can not participate if sent amount is lower than 0.001 ether", async () => {
        const { deployedContract, participatorsAddresses } = await setUpContractWithAccounts(lotteryContract);
        try {
            await deployedContract.methods.participateLottery().send({
                from: participatorsAddresses[0],
                value: web3.utils.toWei("0.0009", "ether"),
            });
            (0, chai_1.assert)(false);
        }
        catch (error) {
            (0, chai_1.expect)(error.message).to.includes("You should at least send 1 Ethers");
        }
    });
    it("can participate if sent amount is 0.001 ether", async () => {
        const { deployedContract, participatorsAddresses } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        const numberOfParticipators = await deployedContract.methods
            .getNumberOfParticipators()
            .call();
        const allParticipators = await deployedContract.methods
            .getAllParticipators()
            .call();
        (0, chai_1.expect)(numberOfParticipators).to.be.equal("1");
        (0, chai_1.expect)(allParticipators.includes(participatorsAddresses[0])).to.be.true;
    });
    it("Registry balance is update when a participatorsAddresses enter the lottery", async () => {
        const { deployedContract, participatorsAddresses } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        const registryBalance = await deployedContract.methods.getBalance().call();
        (0, chai_1.expect)(registryBalance).to.be.equal("1000000000000000");
    });
    it("Can get participatorsAddresses address", async () => {
        const { deployedContract, participatorsAddresses } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        const participatorAddress = await deployedContract.methods
            .getParticipatorAddress(1)
            .call();
        (0, chai_1.expect)(participatorAddress).to.be.equal(participatorsAddresses[0]);
    });
    it("Multiple participatorsAddresses can enter the lottery", async () => {
        const { deployedContract, participatorsAddresses } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[1],
            value: web3.utils.toWei("0.001", "ether"),
        });
        const numberOfParticipators = await deployedContract.methods
            .getNumberOfParticipators()
            .call();
        const allParticipators = await deployedContract.methods
            .getAllParticipators()
            .call();
        (0, chai_1.expect)(numberOfParticipators).to.be.equal("2");
        (0, chai_1.expect)(allParticipators.includes(participatorsAddresses[0])).to.be.true;
        (0, chai_1.expect)(allParticipators.includes(participatorsAddresses[1])).to.be.true;
    });
    it("can not participate twice", async () => {
        const { deployedContract, participatorsAddresses } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        try {
            await deployedContract.methods.participateLottery().send({
                from: participatorsAddresses[0],
                value: web3.utils.toWei("0.001", "ether"),
            });
            (0, chai_1.assert)(false);
        }
        catch (error) {
            (0, chai_1.expect)(error.message).to.includes("Already registered");
        }
    });
    it("Only organizer can pick a winner", async () => {
        const { deployedContract, participatorsAddresses } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        try {
            await deployedContract.methods.pickWinner().send({
                from: participatorsAddresses[0],
            });
            (0, chai_1.assert)(false);
        }
        catch (error) {
            (0, chai_1.expect)(error.message).to.includes("Only the organizer can pick a winner");
        }
    });
    it("Organizer can pick a winner", async () => {
        const { deployedContract, participatorsAddresses, organizerAddress } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        await deployedContract.methods.pickWinner().send({
            from: organizerAddress,
        });
        const registryBalance = await deployedContract.methods.getBalance().call();
        (0, chai_1.expect)(registryBalance).to.equal("0");
    });
    it("After picking a winner a new round starts", async () => {
        const { deployedContract, participatorsAddresses, organizerAddress } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        await deployedContract.methods.pickWinner().send({
            from: organizerAddress,
        });
        const lotteryRound = await deployedContract.methods
            .lotteryRoundNumber()
            .call();
        (0, chai_1.expect)(lotteryRound).to.equal("2");
    });
    it("After picking a winner a new round starts with empty participatorsAddresses", async () => {
        const { deployedContract, participatorsAddresses, organizerAddress } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        await deployedContract.methods.pickWinner().send({
            from: organizerAddress,
        });
        const currentParticipatorsAddresses = await deployedContract.methods
            .getAllParticipators()
            .call();
        const numberOfParticipators = await deployedContract.methods
            .getNumberOfParticipators()
            .call();
        (0, chai_1.expect)(currentParticipatorsAddresses).deep.equal([]);
        (0, chai_1.expect)(numberOfParticipators).to.equal("0");
    });
    it("After picking a winner a new round starts and previous participators can participate again", async () => {
        const { deployedContract, participatorsAddresses, organizerAddress } = await setUpContractWithAccounts(lotteryContract);
        await deployedContract.methods.participateLottery().send({
            from: participatorsAddresses[0],
            value: web3.utils.toWei("0.001", "ether"),
        });
        await deployedContract.methods.pickWinner().send({
            from: organizerAddress,
        });
        const canParticipateAgain = await deployedContract.methods
            .canParticipate()
            .call({
            from: participatorsAddresses[0],
        });
        (0, chai_1.expect)(canParticipateAgain).to.equal(true);
    });
});
//# sourceMappingURL=Lottery.test.js.map