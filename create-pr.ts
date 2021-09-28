import { token } from "./creds.ts";
import { Octokit } from "https://cdn.skypack.dev/@octokit/core?dts";
const baseUrl = 'https://api.github.com';
const mainBranchName = 'main';
const type = 'users'; // 'user'|'org'
const ghClient = new Octokit({
  baseUrl,
  auth: token,
});
const root = "kahgeh";
const repo = "study-spork";

async function branchOffMaster(repo: string, owner: string, sourceBranchName: string, newBranchName: string) {
  const main = await ghClient.request(`GET /repos/{owner}/{repo}/git/ref/{ref}`, {
    owner,
    repo,
    ref: `heads/${sourceBranchName}`
  })

  return await ghClient.request(`POST /repos/{owner}/{repo}/git/refs`, {
    owner,
    repo, 
    ref: newBranchName,
    sha: main.data.object.sha 
    });

}

async function main(): Promise<void> {
  // const repositories = await ghClient.request(`GET /${type}/{org}/repos`, { org });
  // console.log(JSON.stringify(repositories));
  const newBranch = await branchOffMaster(repo, root, mainBranchName, 'refs/heads/test');
  console.log(JSON.stringify(newBranch));
  return;
}

await main();
