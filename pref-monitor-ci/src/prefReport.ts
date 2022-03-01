import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as task from "azure-pipelines-task-lib/task";

const { v4: uuid4 } = require("uuid");

export class PrefReportCI {
  #prefMonitor: string = "pref-report-cli@0.0.1";
  #commentFilePath: string = "";

  constructor() {
    this.#commentFilePath = path.join(
      task.getVariable("Build.SourcesDirectory") || "",
      "/comment.txt"
    );
  }

  async run() {
    const prefMonitor = this.#prefMonitor;
    const isInstalledPrefMonitor = task.which(prefMonitor);

    if (!isInstalledPrefMonitor) {
      task.debug(
        `-------${prefMonitor} is not found. Installing ${prefMonitor}------`
      );
      await this.installPrefMonitor();
    }
    await this.runPrefMonitor();
    //@TODO
    // this.setBuildContext();
  }

  async runPrefMonitor() {
    const prefInstall = task.which(this.#prefMonitor);
    if (!prefInstall) return;
    const prefTool = await task.tool(this.#prefMonitor);
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

  private readComment() {
    try {
      const filePath = this.#commentFilePath;
      const data = fs.readFileSync(filePath);
      console.log("data", data);
    } catch (e) {}
  }

  private async installPrefMonitor() {
    try {
      const tempDir = task.getVariable("agent.tempDirectory") || process.cwd();
      task.checkPath(tempDir, `${tempDir} ${tempDir}`);
      const filePath = path.join(tempDir, uuid4() + ".sh");
      if (os.platform() !== "win32")
        fs.writeFileSync(
          filePath,
          `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install -g ${
            this.#prefMonitor
          }`,
          { encoding: "utf8" }
        );

      const prefMonitorInstall = await task
        .tool(task.which("bash"))
        .arg(filePath)
        .exec();

      if (prefMonitorInstall !== 0) throw new Error("Failed to install");
      else {
        task.debug("-------Successfully installed CLI------");
        return;
      }
    } catch (error) {
      task.setResult(task.TaskResult.Failed, error);
    }
  }
}
