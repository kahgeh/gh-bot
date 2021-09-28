import {
  parse as yamlParse,
  parseAll as yamlParseAll,
  stringify as yamlStringify,
} from "https://deno.land/std/encoding/yaml.ts";
import {
  decode as base64Decode,
  encode as base64Encode,
} from "https://deno.land/std/encoding/base64.ts";
import { token } from "./creds.ts";
import { Octokit } from "https://cdn.skypack.dev/@octokit/core?dts";
import { TextContent } from "./types/bot.ts";

const baseUrl = "https://api.github.com";
const mainBranchName = "main";

const ghClient = new Octokit({
  baseUrl,
  auth: token,
});
const root = "kahgeh";
const repo = "study-spork";

async function branchOffMaster(
  repo: string,
  owner: string,
  sourceBranchName: string,
  newBranchRef: string,
) {
  const main = await ghClient.request(
    `GET /repos/{owner}/{repo}/git/ref/{ref}`,
    {
      owner,
      repo,
      ref: `heads/${sourceBranchName}`,
    },
  );

  return await ghClient.request(`POST /repos/{owner}/{repo}/git/refs`, {
    owner,
    repo,
    ref: newBranchRef,
    sha: main.data.object.sha,
  });
}

async function getContent(
  repo: string,
  owner: string,
  path: string,
): Promise<TextContent> {
  const response = await ghClient.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path,
    },
  );
  const responseData = (response.data as any);
  const { content, sha } = responseData;
  const textDecoder = new TextDecoder("utf-8");
  return { text: textDecoder.decode(base64Decode(content)), sha };
}

function saveContent(
  content: TextContent,
  path: string,
  branch: string,
  message: string,
  repo: string,
  owner: string,
) {
  const { text, sha } = content;

  const base64Content = base64Encode(text);
  return ghClient.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner,
    repo,
    path,
    message,
    content: base64Content,
    sha,
    branch,
  });
}

async function createPR(
  head: string,
  base: string,
  title: string,
  repo: string,
  owner: string,
) {
  return ghClient.request("POST /repos/{owner}/{repo}/pulls", {
    owner,
    repo,
    head,
    base,
    title,
  });
}

function modifyYamlContent(originalContent: string) {
  const data = yamlParse(originalContent) as any;
  data.field2 = "something fancy";
  return yamlStringify(data);
}

async function main(): Promise<void> {
  const newBranchName = "test";
  const path = "some.yml";
  const message = "update to something fancy";
  const prTitle = "thou shalt merge";
  const newBranch = await branchOffMaster(
    repo,
    root,
    mainBranchName,
    `refs/heads/${newBranchName}`,
  );
  console.log(JSON.stringify(newBranch));
  const originalContent = await getContent(repo, root, path);
  const modifiedContent = modifyYamlContent(originalContent.text);
  console.log(`modified ${originalContent} to ${modifiedContent}`);
  const saveResult = await saveContent(
    { text: modifiedContent, sha: originalContent.sha },
    path,
    newBranchName,
    message,
    repo,
    root,
  );
  console.log(JSON.stringify(saveResult));
  const createPRResult = await createPR(
    newBranchName,
    mainBranchName,
    prTitle,
    repo,
    root,
  );
  console.log(JSON.stringify(createPRResult));
  return;
}

await main();
