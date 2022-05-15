import * as task from "azure-pipelines-task-lib/task";
import { CreatePRComment } from "./createPrComment";
import { PrefReportCI } from "./prefReport";

const exec = new PrefReportCI();
exec
  .run()
  .then(() => {
    const commentLHReport = new CreatePRComment();
    commentLHReport.commentReport();
  })
  .catch((error) => task.setResult(task.TaskResult.Failed, error));
