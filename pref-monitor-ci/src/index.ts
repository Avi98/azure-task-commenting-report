import * as task from "azure-pipelines-task-lib/task";
import { commentLHReport } from "./createPrComment";
import { PrefReportCI } from "./prefReport";

const exec = new PrefReportCI();
exec
  .run()
  .then(() => commentLHReport.commentReport())
  .catch((error) => task.setResult(task.TaskResult.Failed, error));
