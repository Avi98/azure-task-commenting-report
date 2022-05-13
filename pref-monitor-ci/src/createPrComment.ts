import fs from "fs";
import path from "path";
import * as task from "azure-pipelines-task-lib";
import * as webApi from "azure-devops-node-api/WebApi";
import { variables } from "./utils/variables";

interface ICreatePRComment {
  commentReport: VoidFunction;
}

const reportPath = path.resolve(variables.Env.Agent.TempDir, "comment.md");

class CreatePRComment implements ICreatePRComment {
  #commentFilePath: string | null;
  #canWriteComment: boolean;
  #serverURL: string;
  #pat: string;

  constructor() {
    this.#commentFilePath = reportPath;
    this.#canWriteComment = fs.existsSync(this.#commentFilePath);
    this.#serverURL = variables.Env.System.ServerURL!;
    this.#pat = variables.Env.Params.PAT!;
  }

  private async getClient() {
    const pat = this.#pat;
    const serverURL = this.#serverURL;
    const handler = webApi.getPersonalAccessTokenHandler(pat)!;
    const connection = new webApi.WebApi(serverURL, handler);
    return await connection.getGitApi()!;
  }

  commentReport() {
    if (!this.#canWriteComment) {
      task.debug(`Comment file does not exist at ${this.#commentFilePath}`);
      return;
    }
    if (!this.#commentFilePath) {
      task.debug("Comment file path does not exist");
      return;
    }
    task.debug("Started to read LH_report from LH file");

    const hasComment = fs.existsSync(this.#commentFilePath);
    if (!hasComment) {
      task.debug("file not found at path--->" + this.#commentFilePath);
      task.setResult(task.TaskResult.Failed, "comment file does not exists");
      return;
    }

    const LH_REPORT_COMMENT = fs.readFileSync(this.#commentFilePath);
    task.debug("----comment----");
    task.debug(LH_REPORT_COMMENT.toString());
    task.debug("---------------");

    const repositoryId = variables.Env.Params.RepositoryId;
    const pullRequestIdString = variables.Env.System.PullRequestId;

    task.debug(`pull request ID--> ${pullRequestIdString}`);
    if (!pullRequestIdString) return;
    const pullRequestId = parseInt(pullRequestIdString);
    this.getClient()
      .then(async (client) => {
        task.debug("connection git api found ");
        const threads = await client.getThreads(repositoryId, pullRequestId);

        for (const thread of threads) {
          console.log("thead", thread);
          if (thread.comments) {
            for (let comment of thread.comments) {
              task.debug("thread.comments" + JSON.stringify(comment));

              // update comment on every run
              if (comment?.content === LH_REPORT_COMMENT.toString()) {
                return (comment.content = LH_REPORT_COMMENT.toString());
              }
            }
          }

          return await client
            .createThread(
              {
                comments: [
                  {
                    content: LH_REPORT_COMMENT.toString(),
                  },
                ],
              },
              repositoryId,
              pullRequestId
            )
            .then(() => {
              task.debug("new thread comment created");
            })
            .catch(() => {
              throw new Error("New Thread cant be created");
            });
        }
        //remove comment file
        if (hasComment) {
          fs.unlinkSync(this.#commentFilePath!);
        }
        return null;
      })
      .catch((e) => {
        throw new Error(task.loc("Failed to create the thread--->", e));
      });
  }
}

export const commentLHReport = new CreatePRComment();
