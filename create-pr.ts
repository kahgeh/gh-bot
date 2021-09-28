import {
    decode as base64Decode,
} from 'https://deno.land/std/encoding/base64.ts';
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

async function branchOffMaster(repo: string, owner: string, sourceBranchName: string, newBranchRef: string) {
  const main = await ghClient.request(`GET /repos/{owner}/{repo}/git/ref/{ref}`, {
    owner,
    repo,
    ref: `heads/${sourceBranchName}`
  })

  return await ghClient.request(`POST /repos/{owner}/{repo}/git/refs`, {
    owner,
    repo, 
    ref: newBranchRef,
    sha: main.data.object.sha 
    });

}

async function getContent(repo: string, owner: string, path: string){
  const response = await ghClient.request('GET /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo,
    path
  });
  return base64Decode((response.data as any).content);
}

async function main(): Promise<void> {
  // const repositories = await ghClient.request(`GET /${type}/{org}/repos`, { org });
  // console.log(JSON.stringify(repositories));

  const newBranchName = 'test';
  const newBranch = await branchOffMaster(repo, root, mainBranchName, `refs/heads/${newBranchName}`);
  console.log(JSON.stringify(newBranch));
  const path = 'some.yml';
  const content = await getContent(repo, root, path);
  const textDecoder = new TextDecoder('utf-8');
  console.log(textDecoder.decode(content));
  return;
}

await main();
