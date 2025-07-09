import {Octokit} from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import fs from "fs";
import 'dotenv/config';
import os from "os";
import path from "path";


// GitHub App credentials
const appId = process.env.GITHUB_APP_ID;
const userHomeDir = os.homedir();
const filePath = path.join(userHomeDir, process.env.PEM_PATH);
const privateKey = fs.readFileSync(filePath, "utf8");
const org = process.env.GITHUB_ORG_NAME;
const startDate = "2025-07-01";
const endDate = "2025-07-10";

async function main() {
  const octokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
      installationId: process.env.INSTALLATION_ID, // Get this from GitHub App installation
    },
  });

  const repos = await octokit.paginate(octokit.rest.repos.listForOrg, {
    org,
    type: "all",
    per_page: 100,
  });

  let totalDocLinesAdded = 0;
  let totalDocLinesDeleted = 0;
  console.log("Running query...");

  for (const repo of repos) {
    const commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner: org,
      repo: repo.name,
      since: startDate,
      until: endDate,
      per_page: 100,
    });

    for (const commit of commits) {
      const { data: commitDetails } = await octokit.rest.repos.getCommit({
        owner: org,
        repo: repo.name,
        ref: commit.sha,
      });

      for (const file of commitDetails.files || []) {
        if (isDocFile(file.filename)) {
          const additions = file.additions || 0;
          const deletions = file.deletions || 0;
          totalDocLinesAdded += additions; // you can subtract deletions if desired
          totalDocLinesDeleted += deletions;
        }
      }
    }
  }

  console.log(`Total documentation lines added: ${totalDocLinesAdded}`);
  console.log(`Total documentation lines deleted: ${totalDocLinesDeleted}`);
}

function isDocFile(filename) {
  return (
    filename.match(/\.md$|\.rst$|\.adoc$/i) ||
    filename.match(/^docs\/|\/docs\//i)
  );
}

main().catch(console.error);
