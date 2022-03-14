import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as task from "azure-pipelines-task-lib/task";
import { variables } from "./utils/variables";

const { v4: uuid4 } = require("uuid");

export class PrefReportCI {
  #prefMonitor: string = "pref-report-cli";
  #configFilePath: string = "";

  constructor() {
    this.#configFilePath =
      variables.Env.Params.ConfigFile ||
      path.join(process.cwd(), "webVitalsrc.js");
  }

  async run() {
    const configFile = this.#configFilePath;

    task.debug(configFile);
    const prefMonitor = this.#prefMonitor;
    const isInstalledPrefMonitor = task.which(prefMonitor);

    if (!isInstalledPrefMonitor) {
      task.debug(
        `-------${prefMonitor} is not found. Installing ${prefMonitor}------`
      );
      await this.installPrefMonitor();
    }
    task.debug(
      `-------${prefMonitor} is found at ${isInstalledPrefMonitor}------`
    );
    await this.runPrefMonitor();
    //@TODO
    // this.setBuildContext();
  }

  async runPrefMonitor() {
    const prefTool = this.#prefMonitor;
    const hasPrefTool = task.which(prefTool);
    task.debug(`prefTool --configFilePath ${this.#configFilePath}`);
    console.log("file path", this.#configFilePath);
    if (!hasPrefTool) return;
    await task
      .tool(prefTool)
      .line("--markdown")
      .line(`--configFilePath ${this.#configFilePath}`)
      .exec()
      .then(() => {
        task.debug(`-------Completed running the ${this.#prefMonitor}------`);
      })
      .catch((error: any) => {
        task.setResult(task.TaskResult.Failed, error);
      });
  }

  // private readComment() {
  //   try {
  //     const filePath = this.#commentFilePath;
  //     const data = fs.readFileSync(filePath);
  //     console.log("data", data);
  //   } catch (e) {}
  // }

  private async installPrefMonitor() {
    try {
      const tempDir = task.getVariable("agent.tempDirectory") || process.cwd();
      task.checkPath(tempDir, `${tempDir} ${tempDir}`);
      const filePath = path.join(process.cwd(), uuid4() + ".sh");
      if (os.platform() !== "win32")
        fs.writeFileSync(
          filePath,
          `sudo PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install -g ${
            this.#prefMonitor
          } --unsafe-perm=true --allow-root`,
          { encoding: "utf8" }
        );

      const prefMonitorInstall = await task
        .tool(task.which("bash"))
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
