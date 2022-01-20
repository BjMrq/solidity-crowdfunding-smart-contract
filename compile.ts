import { resolve } from "path";
import { readFileSync, emptyDirSync, writeJSONSync } from "fs-extra";
import solc from "solc";
import * as R from "ramda";

const compiledContractDirectory = "compiled";

const getFilePathLocationFor = (pathFromRoot: string[]) => {
  const runFromDistFolder = __dirname.includes("dist");

  const ifRunFromDistFolderPathOneLevelDown = runFromDistFolder ? [".."] : [];

  return resolve(
    __dirname,
    ...ifRunFromDistFolderPathOneLevelDown,
    ...pathFromRoot
  );
};

const getContractSourceCodeFor = (fileNameToCompile: string) => {
  console.log(`📥 Compiling ${fileNameToCompile}...`);

  const contractPathLocation = getFilePathLocationFor([
    "contracts",
    `${fileNameToCompile}.sol`,
  ]);

  return readFileSync(contractPathLocation, "utf8");
};

const startCompilationFor = (
  fileNameToCompile: string,
  contractSourceCode: string
): solc.CompilerOutput["contracts"] => {
  const compileConfigBase = {
    language: "Solidity",
    sources: {},
    settings: {
      outputSelection: {
        "*": {
          "*": ["*"],
        },
      },
    },
  };

  const compileConfigWithSourceCode = R.assocPath(
    ["sources", `${fileNameToCompile}.sol`, "content"],
    contractSourceCode,
    compileConfigBase
  );

  const { contracts, errors } = JSON.parse(
    solc.compile(JSON.stringify(compileConfigWithSourceCode))
  );

  if (errors)
    console.log(`❌ ${fileNameToCompile} compiled with errors:\n`, errors);
  else console.log(`✅ ${fileNameToCompile} compiled with no error!`);

  return contracts;
};

const saveCompiledContracts = (
  compiledContracts: solc.CompilerOutputContracts[string]
) => {
  emptyDirSync(getFilePathLocationFor([compiledContractDirectory]));

  Object.entries(compiledContracts).map(([contractName, compiledContract]) => {
    writeJSONSync(
      getFilePathLocationFor([
        compiledContractDirectory,
        `${contractName}.json`,
      ]),
      compiledContract
    );
    console.log(`📝 ${contractName} saved`);
  });
};

export const compileContract = (fileNameToCompile: string) => {
  const contractsSourceCode = getContractSourceCodeFor(fileNameToCompile);

  const contracts = startCompilationFor(fileNameToCompile, contractsSourceCode);

  saveCompiledContracts(contracts[`${fileNameToCompile}.sol`]);

  return contracts[`${fileNameToCompile}.sol`];
};

// compileContract(process.argv[2]);
