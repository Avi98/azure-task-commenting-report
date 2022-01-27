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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var _prefMonitor, _prefMonitorVersion, _commentFilePath;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrefReportCI = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const task = __importStar(require("azure-pipelines-task-lib/task"));
class PrefReportCI {
    constructor() {
        _prefMonitor.set(this, "web-vitals-cli");
        _prefMonitorVersion.set(this, "");
        _commentFilePath.set(this, "");
        __classPrivateFieldSet(this, _prefMonitorVersion, task.getInput("prefMonitorVersion", false) || null);
        __classPrivateFieldSet(this, _commentFilePath, path.join(task.getVariable("Build.SourcesDirectory") || "", "/comment.txt"));
    }
    async run() {
        const prefMonitor = __classPrivateFieldGet(this, _prefMonitor);
        const isInstalledPrefMonitor = task.which(prefMonitor, false);
        if (!isInstalledPrefMonitor) {
            task.debug(`-------${prefMonitor} is not found. Installing ${prefMonitor}------`);
            await this.installPrefMonitor();
        }
        this.runPrefMonitor();
    }
    runPrefMonitor() {
        const prefTool = task.tool(__classPrivateFieldGet(this, _prefMonitor));
        prefTool
            .line("-r")
            .exec()
            .then(() => {
            this.readComment();
        })
            .catch((error) => {
            task.setResult(task.TaskResult.Failed, error);
        });
    }
    readComment() {
        try {
            const filePath = __classPrivateFieldGet(this, _commentFilePath);
            const data = fs.readFileSync(filePath);
            console.log("data", data);
        }
        catch (e) { }
    }
    async installPrefMonitor() {
        try {
            const args = ["install", "-g"];
            if (__classPrivateFieldGet(this, _prefMonitorVersion)) {
                args.push(`${__classPrivateFieldGet(this, _prefMonitor)}@${__classPrivateFieldGet(this, _prefMonitorVersion)}`);
            }
            else {
                args.push(__classPrivateFieldGet(this, _prefMonitor));
            }
            await task.exec("npm", args);
            task.debug(`-----${__classPrivateFieldGet(this, _prefMonitor)} installed successfully-----`);
        }
        catch (error) {
            debugger;
            task.setResult(task.TaskResult.Failed, error);
        }
    }
}
exports.PrefReportCI = PrefReportCI;
_prefMonitor = new WeakMap(), _prefMonitorVersion = new WeakMap(), _commentFilePath = new WeakMap();
//# sourceMappingURL=prefReport.js.map