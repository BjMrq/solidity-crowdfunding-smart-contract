import Web3 from "web3";
import HDWalletProvider from "truffle-hdwallet-provider";
import { compileContract } from "./compile";
import { mnemonic, nodeHTTP } from "./config/variables";
import solc from "solc";

// const preSetUp = async (contractName: string) => {
//   const provider = new HDWalletProvider(mnemonic, nodeHTTP);

//   //@ts-expect-error
//   const web3 = new Web3(provider);

//   return {
//     web3,
//     provider,
//     contract: compileContract(contractName),
//     accounts: await web3.eth.getAccounts(),
//   };
// };

// const deployContract = async (contractName: string) => {
//   const { web3, contract, accounts, provider } = await preSetUp(contractName);

//   const {
//     options: { address },
//   } = await new web3.eth.Contract(contract.abi as solc.Abi)
//     .deploy({
//       data: contract?.evm?.bytecode.object as string,
//     })
//     .send({
//       gas: 2000000,
//       from: accounts[0],
//     });

//   console.log(JSON.stringify(contract.abi));
//   console.log(`Contract deployed at: ${address}`);

//   provider.engine.stop();
// };

// deployContract(process.argv[2]);
