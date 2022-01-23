export class PrefReportCI {
  private configFilePath: string;
  private params: string;

  constructor() {
    this.params = task.getInput("params") || "";
    this.configFilePath = task.getInput("configFilePath") || "";
  }

  async run() {}
  private async hasPremonitorTool() {
    const prefMonitor = "web-vitals-cli";
    const isInstalledPrefMonitor = task.which(prefMonitor, false);

    if (!isInstalledPrefMonitor) {
      task.debug(
        `-------${prefMonitor} is not found. Installing ${prefMonitor}------`
      );
    }
  }
}
