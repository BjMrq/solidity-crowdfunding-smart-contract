"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileContract = void 0;
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const solc_1 = __importDefault(require("solc"));
const R = __importStar(require("ramda"));
const compiledContractDirectory = "compiled";
const getFilePathLocationFor = (pathFromRoot) => {
    const runFromDistFolder = __dirname.includes("dist");
    const ifRunFromDistFolderPathOneLevelDown = runFromDistFolder ? [".."] : [];
    return (0, path_1.resolve)(__dirname, ...ifRunFromDistFolderPathOneLevelDown, ...pathFromRoot);
};
const getContractSourceCodeFor = (fileNameToCompile) => {
    console.log(`📥 Compiling ${fileNameToCompile}...`);
    const contractPathLocation = getFilePathLocationFor([
        "contracts",
        `${fileNameToCompile}.sol`,
    ]);
    return (0, fs_extra_1.readFileSync)(contractPathLocation, "utf8");
};
const startCompilationFor = (fileNameToCompile, contractSourceCode) => {
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
    const compileConfigWithSourceCode = R.assocPath(["sources", `${fileNameToCompile}.sol`, "content"], contractSourceCode, compileConfigBase);
    const { contracts, errors } = JSON.parse(solc_1.default.compile(JSON.stringify(compileConfigWithSourceCode)));
    if (errors)
        console.log(`❌ ${fileNameToCompile} compiled with errors:\n`, errors);
    else
        console.log(`✅ ${fileNameToCompile} compiled with no error!`);
    return contracts;
};
const saveCompiledContracts = (compiledContracts) => {
    (0, fs_extra_1.emptyDirSync)(getFilePathLocationFor([compiledContractDirectory]));
    Object.entries(compiledContracts).map(([contractName, compiledContract]) => {
        (0, fs_extra_1.writeJSONSync)(getFilePathLocationFor([
            compiledContractDirectory,
            `${contractName}.json`,
        ]), compiledContract);
        console.log(`📝 ${contractName} saved`);
    });
};
const compileContract = (fileNameToCompile) => {
    const contractsSourceCode = getContractSourceCodeFor(fileNameToCompile);
    const contracts = startCompilationFor(fileNameToCompile, contractsSourceCode);
    saveCompiledContracts(contracts[`${fileNameToCompile}.sol`]);
    return contracts[`${fileNameToCompile}.sol`];
};
exports.compileContract = compileContract;
(0, exports.compileContract)(process.argv[2]);
//# sourceMappingURL=compile.js.map