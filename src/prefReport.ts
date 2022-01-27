import * as fs from "fs";
import * as path from "path";
import * as task from "azure-pipelines-task-lib/task";

export class PrefReportCI {
  #prefMonitor: string = "web-vitals-cli";
  #prefMonitorVersion: string | null = "";
  #commentFilePath: string = "";

  constructor() {
    this.#prefMonitorVersion =
      task.getInput("prefMonitorVersion", false) || null;
    this.#commentFilePath = path.join(
      task.getVariable("Build.SourcesDirectory") || "",
      "/comment.txt"
    );
  }

  async run() {
    const prefMonitor = this.#prefMonitor;
    const isInstalledPrefMonitor = task.which(prefMonitor, false);

    if (!isInstalledPrefMonitor) {
      task.debug(
        `-------${prefMonitor} is not found. Installing ${prefMonitor}------`
      );
      await this.installPrefMonitor();
    }
    this.runPrefMonitor();
    // this.setBuildContext();
  }

  runPrefMonitor() {
    const prefTool = task.tool(this.#prefMonitor);
    prefTool
      .line("-r")
      .exec()
      .then(() => {
        //read the file
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
      const args = ["install", "-g"];
      if (this.#prefMonitorVersion) {
        args.push(`${this.#prefMonitor}@${this.#prefMonitorVersion}`);
      } else {
        args.push(this.#prefMonitor);
      }
      await task.exec("npm", args);

      task.debug(`-----${this.#prefMonitor} installed successfully-----`);
    } catch (error) {
      debugger;
      task.setResult(task.TaskResult.Failed, error);
    }
  }
}
