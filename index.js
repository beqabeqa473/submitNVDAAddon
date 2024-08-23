const github = require("@actions/github");
const core = require("@actions/core");

class SubmitNVDAAddonAction {
  constructor() {
    this.initialize();
  }

  initialize() {
    this.token = this.getRequiredInput("token");
    this.octokit = github.getOctokit(this.token);
    const { repo, owner } = github.context.repo;
    this.repo = repo;
    this.owner = owner;

    this.addonName = this.getRequiredInput("addon_name");
    this.addonVersion = this.getValidatedVersion();
    this.downloadUrl = this.getRequiredInput("download_url");

    this.sourceUrl = core.getInput("source_url") || `https://github.com/${this.owner}/${this.repo}`;
    this.publisher = core.getInput("publisher") || this.owner;
    this.channel = this.getValidatedChannel();
    this.licenseName = core.getInput("license_name");
    this.licenseUrl = core.getInput("license_url");

    this.issueTitle = `[Submit add-on]: ${this.addonName}-v${this.addonVersion}`;
    this.issueTemplate = "Add-on registration";
    this.markdownTemplate = this.generateMarkdownTemplate();
  }

  getRequiredInput(name) {
    const input = core.getInput(name);
    if (!input) {
      throw new Error(`Input "${name}" is required but was not provided.`);
    }
    return input;
  }

  getValidatedChannel() {
    const validChannels = ["stable", "beta", "dev"];
    const channel = core.getInput("channel").trim().toLowerCase();
    if (channel && !validChannels.includes(channel)) {
      throw new Error(`Invalid channel: "${channel}". Valid options are: ${validChannels.join(", ")}.`);
    }
    return channel;
  }

  getValidatedVersion() {
    const version = this.getRequiredInput("addon_version");
    const versionRegex = /^(?:\d+\.\d+\.\d+)(?:\.\d+)?$/;
    if (!versionRegex.test(version)) {
      throw new Error(`The version format "${version}" is invalid. Expected formats are Major.Minor.Patch or Major.Minor.Patch.Build.`);
    }
    return version;
  }

  generateMarkdownTemplate() {
    return `
### Download URL

${this.downloadUrl}

### Source URL

${this.sourceUrl}

### Publisher

${this.publisher}

### Channel

${this.channel}

### License Name

${this.licenseName}

### License URL

${this.licenseUrl}
`;
  }

  async getRepositoryNodeId(owner, repo) {
    const query = `
      query ($owner: String!, $repo: String!) {
        repository(owner: $owner, name: $repo) {
          id
        }
      }
    `;

    try {
      const { repository: { id } } = await this.octokit.graphql(query, { owner, repo });
      return id;
    } catch (error) {
      throw new Error(`Error fetching repository node ID for ${owner}/${repo}: ${error.message}`);
    }
  }

  async createIssue(repoId) {
    const mutation = `
      mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
          issue {
            number
          }
        }
      }
    `;

    const variables = {
      input: {
        repositoryId: repoId,
        title: this.issueTitle,
        body: this.markdownTemplate,
        issueTemplate: this.issueTemplate,
      },
    };

    try {
      const { createIssue: { issue: { number } } } = await this.octokit.graphql(mutation, variables);
      return number;
    } catch (error) {
      throw new Error(`Error creating issue in repository ${repoId}: ${error.message}`);
    }
  }

  async run() {
    const nodeId = await this.getRepositoryNodeId("nvaccess", "addon-datastore");
    const issueNumber = await this.createIssue(nodeId);
    core.setOutput("issue_number", issueNumber);
  }
}

(async () => {
  try {
    const submitAction = new SubmitNVDAAddonAction();
    await submitAction.run();
  } catch (error) {
    core.setFailed(`Action failed: ${error.message}`);
  }
})();
