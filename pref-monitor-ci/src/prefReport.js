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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PrefReportCI_prefMonitor, _PrefReportCI_configFilePath;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefReportCI = void 0;
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const task = __importStar(require("azure-pipelines-task-lib/task"));
const variables_1 = require("./utils/variables");
const { v4: uuid4 } = require("uuid");
class PrefReportCI {
    constructor() {
        _PrefReportCI_prefMonitor.set(this, "pref-report-cli");
        _PrefReportCI_configFilePath.set(this, "");
        __classPrivateFieldSet(this, _PrefReportCI_configFilePath, path.resolve(variables_1.variables.Env.Params.SourceDirectory, "webVitalsrc.js"), "f");
    }
    async run() {
        const prefMonitor = __classPrivateFieldGet(this, _PrefReportCI_prefMonitor, "f");
        const isInstalledPrefMonitor = task.which(prefMonitor);
        if (!isInstalledPrefMonitor) {
            task.debug(`-------${prefMonitor} is not found. Installing ${prefMonitor}------`);
            await this.installPrefMonitor().catch((error) => {
                task.setResult(task.TaskResult.Failed, error);
            });
        }
        task.debug(`-------${prefMonitor} is found at ${isInstalledPrefMonitor}------`);
        await this.runPrefMonitor().catch((error) => {
            task.setResult(task.TaskResult.Failed, error);
        });
    }
    async runPrefMonitor() {
        const prefTool = __classPrivateFieldGet(this, _PrefReportCI_prefMonitor, "f");
        const hasPrefTool = task.which(prefTool);
        task.debug(`prefTool --configFilePath ${__classPrivateFieldGet(this, _PrefReportCI_configFilePath, "f")}`);
        if (!hasPrefTool)
            return;
        await task
            .tool(prefTool)
            .line("--markdown")
            .line(`--configFilePath ${__classPrivateFieldGet(this, _PrefReportCI_configFilePath, "f")}`)
            .exec()
            .then(() => {
            task.debug(`-------Completed running the ${__classPrivateFieldGet(this, _PrefReportCI_prefMonitor, "f")}------`);
        })
            .catch((error) => {
            task.setResult(task.TaskResult.Failed, error);
        });
    }
    async installPrefMonitor() {
        try {
            const tempDir = task.getVariable("agent.tempDirectory") || process.cwd();
            task.checkPath(tempDir, `${tempDir} ${tempDir}`);
            const filePath = path.join(process.cwd(), uuid4() + ".sh");
            task.debug(`os platform----> ${os.platform()}`);
            task.debug(`install puppeteer globally----> ${os.platform()}`);
            const chromePath = task.which("google-chrome");
            if (chromePath) {
                task.debug(`chrome path found at -----> ${chromePath}`);
            }
            else {
                task.debug("chromepath not found");
            }
            if (os.platform() === "win32") {
                fs.writeFileSync(filePath, `sudo PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install -g ${__classPrivateFieldGet(this, _PrefReportCI_prefMonitor, "f")} puppeteer`, { encoding: "utf8" });
            }
            else {
                fs.writeFileSync(filePath, `sudo PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install -g ${__classPrivateFieldGet(this, _PrefReportCI_prefMonitor, "f")} puppeteer`, { encoding: "utf8" });
            }
            task.debug(`---skip chromium install---`);
            const prefMonitorInstall = await task
                .tool(task.which("bash", true))
                .arg("--noprofile")
                .arg(`--norc`)
                .arg(filePath)
                .exec();
            if (prefMonitorInstall !== 0)
                throw new Error("Failed to install");
            else {
                task.debug("-------Successfully installed CLI------");
            }
            fs.unlink(filePath, () => { });
        }
        catch (error) {
            task.setResult(task.TaskResult.Failed, error);
        }
    }
}
exports.PrefReportCI = PrefReportCI;
_PrefReportCI_prefMonitor = new WeakMap(), _PrefReportCI_configFilePath = new WeakMap();
//# sourceMappingURL=prefReport.js.map