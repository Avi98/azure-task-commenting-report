import * as task from "azure-pipelines-task-lib/task";

export const variables = {
  //----env
  Env: {
    //----params
    Params: {
      SourceDirectory: getVariable("build.sourcesDirectory"),
    },
    Agent: {
      JobStatus: getVariable("AGENT_JOB_STATUS"),
      Name: getVariable("AGENT_NAME"),
      TempDir: getVariable("AGENT_TEMPDIRECTORY"),
    },
    System: {
      AccessToken: getVariable("SYSTEM_ACCESSTOKEN"),
      DefinitionName: getVariable("SYSTEM_DEFINITIONNAME"),
      TeamFoundationServerUri: getVariable("SYSTEM_TEAMFOUNDATIONSERVERURI"),
      TeamProject: getVariable("SYSTEM_TEAMPROJECT"),
      SourceDir: getVariable("BUILD_SOURCE_DIRECTORY"),
    },

    //---- debug
    Debug: {
      Pat: getVariable("DEBUG_PAT"),
    },
  },
};

function getVariable(name: string) {
  const v = task.getVariable(name);
  if (!v) return "";

  return v;
}
