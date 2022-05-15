import fs from "fs";
import path from "path";
import * as task from "azure-pipelines-task-lib";
import * as webApi from "azure-devops-node-api/WebApi";
import { variables } from "./utils/variables";
import { GitPullRequestCommentThread } from "azure-devops-node-api/interfaces/GitInterfaces";

interface ICreatePRComment {
  commentReport: VoidFunction;
}

const reportPath = path.resolve(variables.Env.Agent.TempDir, "comment.md");

export class CreatePRComment implements ICreatePRComment {
  #commentFilePath: string | null;
  #canWriteComment: boolean;
  #serverURL: string;
  #pat: string;
  #client: null | ReturnType<typeof this.getClient>;
  #prefReport: Buffer | null;

  constructor() {
    this.#commentFilePath = reportPath;
    this.#canWriteComment = fs.existsSync(this.#commentFilePath);
    this.#serverURL = variables.Env.System.ServerURL!;
    this.#pat = variables.Env.Params.PAT!;
    this.#client = null;
    this.#prefReport = null;
  }

  private async getClient() {
    const pat = this.#pat;
    const serverURL = this.#serverURL;
    const handler = webApi.getPersonalAccessTokenHandler(pat)!;
    const connection = new webApi.WebApi(serverURL, handler);
    const client = connection.getGitApi()!;

    this.#client = client;
    return client;
  }

  private async createNewPrefReportThread({
    commentPayload,
    pullRequestId,
    repoId,
  }: {
    commentPayload: GitPullRequestCommentThread;
    pullRequestId: number;
    repoId: string;
  }) {
    if (!this.#client)
      throw new Error(
        "Git client not found while create new Pref-report thread"
      );
    return await this.#client
      .then((client) =>
        client.createThread(commentPayload, repoId, pullRequestId)
      )
      .then((response) => response);
  }

  private async updatePrefReportComment(
    pullRequestId: number,
    repositoryId: string,
    threadId: number,
    commentId: number
  ) {
    if (!this.#client) return;

    (await this.#client).updateComment(
      { content: this.#prefReport!.toString() },
      repositoryId,
      pullRequestId,
      threadId,
      commentId
    );
  }

  private async createPrefThread(pullRequestId: number, repoId: string) {
    if (!this.#client) throw new Error("Git client not found");

    await this.#client
      .then(async (gitClient) => {
        return await gitClient.getThreads(repoId, pullRequestId);
      })
      .then((commentThreads) => {
        const commentPayload = {
          comments: [
            {
              content: this.#prefReport?.toString(),
            },
          ],
          properties: {
            "is-pref-report": true,
          },
        };
        if (commentThreads.length === 0) {
          this.createNewPrefReportThread({
            commentPayload,
            pullRequestId,
            repoId,
          });
          return;
        }

        const prefReportThread: GitPullRequestCommentThread[] = [];

        commentThreads.forEach((thread) => {
          if ("is-pref-report" in thread.properties) {
            prefReportThread.push(thread);
          }
        });

        prefReportThread.forEach((thread) => {
          // if has thread update thread
          const commentId = thread.comments?.[0].id;
          if (commentId)
            this.updatePrefReportComment(
              pullRequestId,
              repoId,
              thread.id!,
              commentId
            );
        });
        if (prefReportThread.length === 0) {
          this.createNewPrefReportThread({
            commentPayload,
            pullRequestId,
            repoId,
          });
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  async commentReport() {
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
    this.#prefReport = LH_REPORT_COMMENT;
    task.debug("----comment----");
    task.debug(LH_REPORT_COMMENT.toString());
    task.debug("---------------");

    const repositoryId = variables.Env.Params.RepositoryId;
    const pullRequestIdString = variables.Env.System.PullRequestId;

    task.debug(`pull request ID--> ${pullRequestIdString}`);
    if (!pullRequestIdString) return;
    const pullRequestId = parseInt(pullRequestIdString);
    await this.getClient();
    await this.createPrefThread(pullRequestId, repositoryId);
  }
}
