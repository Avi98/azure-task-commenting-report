"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.variables = void 0;
const task = __importStar(require("azure-pipelines-task-lib/task"));
exports.variables = {
    Env: {
        Params: {
            ConfigFile: task.getInput("CONFIGFILEPATH"),
        },
        Agent: {
            JobStatus: getVariable("AGENT_JOB_STATUS"),
            Name: getVariable("AGENT_NAME"),
        },
        System: {
            AccessToken: getVariable("SYSTEM_ACCESSTOKEN"),
            DefinitionName: getVariable("SYSTEM_DEFINITIONNAME"),
            TeamFoundationServerUri: getVariable("SYSTEM_TEAMFOUNDATIONSERVERURI"),
            TeamProject: getVariable("SYSTEM_TEAMPROJECT"),
            SourceDir: getVariable("BUILD_SOURCE_DIRECTORY"),
        },
        Debug: {
            Pat: getVariable("DEBUG_PAT"),
        },
    },
};
function getVariable(name) {
    const v = task.getVariable(name);
    if (!v)
        return "";
    return v;
}
//# sourceMappingURL=variables.js.map