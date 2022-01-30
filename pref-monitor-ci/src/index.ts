import * as task from "azure-pipelines-task-lib/task";
import { PrefReportCI } from "./prefReport";

const exec = new PrefReportCI();
exec.run().catch((error) => task.setResult(task.TaskResult.Failed, error));
