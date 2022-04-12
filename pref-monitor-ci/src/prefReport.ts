import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as task from "azure-pipelines-task-lib/task";
import { variables } from "./utils/variables";
import { commentLHReport } from "./createPrComment";

const { v4: uuid4 } = require("uuid");

export class PrefReportCI {
  #prefMonitor: string = "pref-report-cli";
  #configFilePath: string = "";

  constructor() {
    this.#configFilePath = path.resolve(
      variables.Env.Params.SourceDirectory,
      "webVitalsrc.js"
    );
  }

  async run() {
    const prefMonitor = this.#prefMonitor;
    const isInstalledPrefMonitor = task.which(prefMonitor);

    if (!isInstalledPrefMonitor) {
      task.debug(
        `-------${prefMonitor} is not found. Installing ${prefMonitor}------`
      );
      await this.installPrefMonitor().catch((error) => {
        task.setResult(task.TaskResult.Failed, error);
      });
    }
    task.debug(
      `-------${prefMonitor} is found at ${isInstalledPrefMonitor}------`
    );
    await this.runPrefMonitor().catch((error) => {
      task.setResult(task.TaskResult.Failed, error);
    });
    //@TODO
    // this.setBuildContext();
  }

  async runPrefMonitor() {
    const prefTool = this.#prefMonitor;
    const hasPrefTool = task.which(prefTool);
    task.debug(`prefTool --configFilePath ${this.#configFilePath}`);
    if (!hasPrefTool) return;
    await task
      .tool(prefTool)
      .line("--markdown")
      .line(`--configFilePath ${this.#configFilePath}`)
      .exec()
      .then(() => {
        task.debug(`-------Completed running the ${this.#prefMonitor}------`);
        commentLHReport.commentReport();
      })
      .catch((error: any) => {
        task.setResult(task.TaskResult.Failed, error);
      });
  }

  private async installPrefMonitor() {
    try {
      const tempDir = task.getVariable("agent.tempDirectory") || process.cwd();
      task.checkPath(tempDir, `${tempDir} ${tempDir}`);
      const filePath = path.join(process.cwd(), uuid4() + ".sh");

      task.debug(`os platform----> ${os.platform()}`);
      task.debug(`install puppeteer globally----> ${os.platform()}`);
      const chromePath = task.which("google-chrome");
      if (chromePath) {
        task.debug(`chrome path found at -----> ${chromePath}`);
      } else {
        task.debug("chromepath not found");
      }
      if (os.platform() === "win32") {
        fs.writeFileSync(
          filePath,
          `sudo PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install -g ${
            this.#prefMonitor
          } puppeteer`,
          { encoding: "utf8" }
        );
      } else {
        fs.writeFileSync(
          filePath,
          `sudo PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install -g ${
            this.#prefMonitor
          } puppeteer`,
          { encoding: "utf8" }
        );
      }

      task.debug(`---skip chromium install---`);
      const prefMonitorInstall = await task
        .tool(task.which("bash", true))
        .arg("--noprofile")
        .arg(`--norc`)
        .arg(filePath)
        .exec();

      if (prefMonitorInstall !== 0) throw new Error("Failed to install");
      else {
        task.debug("-------Successfully installed CLI------");
      }
      fs.unlink(filePath, () => {});
    } catch (error) {
      task.setResult(task.TaskResult.Failed, error);
    }
  }
}
