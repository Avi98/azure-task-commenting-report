import fs from "fs";
import path from "path";
import * as task from "azure-pipelines-task-lib";
import * as webApi from "azure-devops-node-api/WebApi";
import { IGitApi } from "azure-devops-node-api/GitApi";

interface ICreatePRComment {
  commentReport: VoidFunction;
}

const reportPath = path.join(process.cwd(), "/comment.md");

/**
 * 1. Authenticate the task using PAT or (Learn about the authentication in Azure service??)
 * 2. User azure client lib to fetch all the list of comments in the Pull request.
 * 	- iterate over the thread and find if the comment is there or not if there ignore
 * 	- Need to have comments as config basis. if comment.md not generated remove don't write the comment on PR
 * 	- if build donesn't have PR don't write the comment
 * 	- if comment is already there don't write comment again(??)
 * fetch all the comments threads.
 */
class CreatePRComment implements ICreatePRComment {
  #commentFilePath: string | null;
  #canWriteComment: boolean;

  constructor() {
    this.#commentFilePath = reportPath;
    this.#canWriteComment = fs.existsSync(this.#commentFilePath);
  }

  private async getClient(): Promise<IGitApi> {
    const pat = task.getInput("AzureDevOpsPat")!;
    const handler = webApi.getPersonalAccessTokenHandler(pat)!;

    const connection = new webApi.WebApi(
      task.getVariable("System.TeamFoundationServerUri")!,
      handler
    );
    return await connection.getGitApi()!;
  }

  /**
   * check if comment is there or not.
   * if comment exists update same comment.
   *
   * If no LH_comment is found. Add comment.
   */
  commentReport() {
    if (!this.#canWriteComment) {
      task.debug("Comment file does not exist");
      return;
    }
    if (!this.#commentFilePath) {
      task.debug("Comment file path does not exist");
      return;
    }
    task.debug("Started to read LH_report from LH file");

    const LH_REPORT_COMMENT = fs.readFileSync(this.#commentFilePath);
    task.debug("----comment----");
    task.debug(LH_REPORT_COMMENT.toString());
    task.debug("---------------");

    const repositoryId = task.getVariable("Build.Repository.ID") || "";
    const pullRequestIdString = task.getVariable(
      "System.PullRequest.PullRequestId"
    );

    if (!pullRequestIdString) return;
    const pullRequestId = parseInt(pullRequestIdString);

    this.getClient()
      .then(async (client) => {
        //check if comment is there on the PR or not
        const threads = await client.getThreads(repositoryId, pullRequestId);
        for (const thread of threads) {
          if (thread.comments) {
            for (let comment of thread.comments) {
              if (comment === LH_REPORT_COMMENT) {
                return (comment.content = LH_REPORT_COMMENT.toString());
              }
            }
          }

          // else if no comment is found the add one
          if (pullRequestId !== 0) {
            return await client.createThread(
              thread,
              repositoryId,
              pullRequestId
            );
          }
        }
        return null;
      })
      .catch((e) => {
        throw new Error(task.loc("Failed to create the thread--->", e));
      });
  }
}

export const commentLHReport = new CreatePRComment();
