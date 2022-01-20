import { assert, expect } from "chai";
import ganache from "ganache-core";
import Web3 from "web3";
import type { Contract } from "web3-eth/node_modules/web3-eth-contract/types/index";
import { compileContract } from "../../compile";
import solc from "solc";

//@ts-expect-error
const web3 = new Web3(ganache.provider());

const crowdfundingContracts = compileContract("Crowdfunding");

const setUpContractWithAccounts = async (
  baseContract: solc.CompiledContract
) => {
  const accounts = await web3.eth.getAccounts();

  return {
    accounts,
    organizerAddress: accounts[0],
    participatorsAddresses: accounts.slice(1),
    deployedContract: await new web3.eth.Contract(baseContract.abi as solc.Abi)
      .deploy({
        data: baseContract?.evm?.bytecode.object as string,
      })
      .send({ from: accounts[0], gas: 2000000 }),
  };
};

const getDeployedContractFromAddressAndABI = async (
  baseContract: solc.CompiledContract,
  contractAddress: string
) => new web3.eth.Contract(baseContract.abi as solc.Abi, contractAddress);

describe("Crowdfunding contract", () => {
  let factoryDeployedContract: Contract;
  let managerAccount: string;
  let contributorsAddresses: string[];
  let deployedCampaignContractsAddress: string;

  before(async () => {
    const {
      deployedContract: factoryContract,
      organizerAddress,
      participatorsAddresses,
    } = await setUpContractWithAccounts(
      crowdfundingContracts["CrowdfundingFactory"]
    );

    factoryDeployedContract = factoryContract;
    managerAccount = organizerAddress;
    contributorsAddresses = participatorsAddresses;
  });

  beforeEach(async () => {
    await factoryDeployedContract.methods
      .deployNewCrowdfundingCampaign(1000)
      .send({ from: managerAccount, gas: "2000000" });

    [deployedCampaignContractsAddress] = await factoryDeployedContract.methods
      .getAllDeployedCrowdfundingCampaigns()
      .call();
  });

  it("Deploys a CrowdfundingFactory contract", async () => {
    const { deployedContract } = await setUpContractWithAccounts(
      crowdfundingContracts["CrowdfundingFactory"]
    );

    expect(deployedContract.options.address).to.be.a("string");
    expect(deployedContract.options.address).to.have.lengthOf(42);
  });

  it("A CrowdfundingFactory contract can deploy a CrowdfundingCampaign contract", async () => {
    factoryDeployedContract.methods
      .deployNewCrowdfundingCampaign("100")
      .send({ from: managerAccount, gas: "2000000" });

    const [deployedCampaignAddresses] = await factoryDeployedContract.methods
      .getAllDeployedCrowdfundingCampaigns()
      .call();

    expect(deployedCampaignAddresses).to.be.a("string");
    expect(deployedCampaignAddresses).to.have.lengthOf(42);
  });

  it("A deployed CrowdfundingCampaign has an address", async () => {
    const campaignContract = await getDeployedContractFromAddressAndABI(
      crowdfundingContracts["CrowdfundingCampaign"],
      deployedCampaignContractsAddress
    );

    expect(campaignContract.options.address).to.be.a("string");
    expect(campaignContract.options.address).to.have.lengthOf(42);
  });

  // it("The creator is the organizer", async () => {
  //   const { deployedContract, organizerAddress } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   const contractOrganizerAddress = await deployedContract.methods
  //     .organizerAddress()
  //     .call();

  //   expect(contractOrganizerAddress).to.be.a("string");
  //   expect(contractOrganizerAddress).to.have.lengthOf(42);
  //   expect(contractOrganizerAddress).to.be.equal(organizerAddress);
  // });

  // it("can not participate if sent amount is lower than 0.001 ether", async () => {
  //   const { deployedContract, participatorsAddresses } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   try {
  //     await deployedContract.methods.participateCrowdfunding().send({
  //       from: participatorsAddresses[0],
  //       value: web3.utils.toWei("0.0009", "ether"),
  //     });

  //     assert(false);
  //   } catch (error) {
  //     expect((error as Error).message).to.includes(
  //       "You should at least send 1 Ethers"
  //     );
  //   }
  // });

  // it("can participate if sent amount is 0.001 ether", async () => {
  //   const { deployedContract, participatorsAddresses } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   const numberOfParticipators = await deployedContract.methods
  //     .getNumberOfParticipators()
  //     .call();

  //   const allParticipators = await deployedContract.methods
  //     .getAllParticipators()
  //     .call();

  //   expect(numberOfParticipators).to.be.equal("1");
  //   expect(allParticipators.includes(participatorsAddresses[0])).to.be.true;
  // });

  // it("Registry balance is update when a participatorsAddresses enter the crowdfunding", async () => {
  //   const { deployedContract, participatorsAddresses } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   const registryBalance = await deployedContract.methods.getBalance().call();

  //   expect(registryBalance).to.be.equal("1000000000000000");
  // });

  // it("Can get participatorsAddresses address", async () => {
  //   const { deployedContract, participatorsAddresses } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   const participatorAddress = await deployedContract.methods
  //     .getParticipatorAddress(1)
  //     .call();

  //   expect(participatorAddress).to.be.equal(participatorsAddresses[0]);
  // });

  // it("Multiple participatorsAddresses can enter the crowdfunding", async () => {
  //   const { deployedContract, participatorsAddresses } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[1],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   const numberOfParticipators = await deployedContract.methods
  //     .getNumberOfParticipators()
  //     .call();

  //   const allParticipators = await deployedContract.methods
  //     .getAllParticipators()
  //     .call();

  //   expect(numberOfParticipators).to.be.equal("2");
  //   expect(allParticipators.includes(participatorsAddresses[0])).to.be.true;
  //   expect(allParticipators.includes(participatorsAddresses[1])).to.be.true;
  // });

  // it("can not participate twice", async () => {
  //   const { deployedContract, participatorsAddresses } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   try {
  //     await deployedContract.methods.participateCrowdfunding().send({
  //       from: participatorsAddresses[0],
  //       value: web3.utils.toWei("0.001", "ether"),
  //     });

  //     assert(false);
  //   } catch (error) {
  //     expect((error as Error).message).to.includes("Already registered");
  //   }
  // });

  // it("Only organizer can pick a winner", async () => {
  //   const { deployedContract, participatorsAddresses } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   try {
  //     await deployedContract.methods.pickWinner().send({
  //       from: participatorsAddresses[0],
  //     });

  //     assert(false);
  //   } catch (error) {
  //     expect((error as Error).message).to.includes(
  //       "Only the organizer can pick a winner"
  //     );
  //   }
  // });

  // it("Organizer can pick a winner", async () => {
  //   const { deployedContract, participatorsAddresses, organizerAddress } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   await deployedContract.methods.pickWinner().send({
  //     from: organizerAddress,
  //   });

  //   const registryBalance = await deployedContract.methods.getBalance().call();

  //   expect(registryBalance).to.equal("0");
  // });

  // it("After picking a winner a new round starts", async () => {
  //   const { deployedContract, participatorsAddresses, organizerAddress } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   await deployedContract.methods.pickWinner().send({
  //     from: organizerAddress,
  //   });

  //   const crowdfundingRound = await deployedContract.methods
  //     .crowdfundingRoundNumber()
  //     .call();

  //   expect(crowdfundingRound).to.equal("2");
  // });

  // it("After picking a winner a new round starts with empty participatorsAddresses", async () => {
  //   const { deployedContract, participatorsAddresses, organizerAddress } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   await deployedContract.methods.pickWinner().send({
  //     from: organizerAddress,
  //   });

  //   const currentParticipatorsAddresses = await deployedContract.methods
  //     .getAllParticipators()
  //     .call();

  //   const numberOfParticipators = await deployedContract.methods
  //     .getNumberOfParticipators()
  //     .call();

  //   expect(currentParticipatorsAddresses).deep.equal([]);
  //   expect(numberOfParticipators).to.equal("0");
  // });

  // it("After picking a winner a new round starts and previous participators can participate again", async () => {
  //   const { deployedContract, participatorsAddresses, organizerAddress } =
  //     await setUpContractWithAccounts(crowdfundingContract);

  //   await deployedContract.methods.participateCrowdfunding().send({
  //     from: participatorsAddresses[0],
  //     value: web3.utils.toWei("0.001", "ether"),
  //   });

  //   await deployedContract.methods.pickWinner().send({
  //     from: organizerAddress,
  //   });

  //   const canParticipateAgain = await deployedContract.methods
  //     .canParticipate()
  //     .call({
  //       from: participatorsAddresses[0],
  //     });

  //   expect(canParticipateAgain).to.equal(true);
  // });
});
