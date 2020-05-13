import { GitHub } from '@actions/github';
import { Octokit } from '@octokit/rest';

export type Release = Octokit.ReposGetLatestReleaseResponse | Octokit.ReposGetReleaseByTagResponse
export type Asset = Octokit.ReposGetLatestReleaseResponseAssetsItem | Octokit.ReposGetReleaseByTagResponseAssetsItem;
export type Tag = Octokit.ReposListTagsResponseItem;

export class GithubService {

  private client: GitHub;

  constructor() {
    const token = process.env.GITHUB_TOKEN;
    if (token == undefined) {
      throw new Error('env var GITHUB_TOKEN not found');
    }

    this.client = new GitHub(token);
  }

  public async getRelease(owner: string, repo: string, version: string): Promise<Release> {
    if (version === 'latest') {
      return await this.client.repos.getLatestRelease({
        owner: owner,
        repo: repo
      })
        .then(release => release.data);
    }

    return await this.client.repos.getReleaseByTag({
      owner: owner,
      repo: repo,
      tag: version
    })
      .then(release => release.data);
  }

  public async getTag(owner: string, repo: string, version: string): Promise<Tag | undefined> {
    const tags = await this.client.repos.listTags({
      owner: owner,
      repo: repo
    })
      .then(tag => tag.data);

    if (version === 'latest') {
      return tags.shift();
    }

    return tags.find(tag => tag.name === version);
  }

  public getAsset(release: Release, filter: (asset: Asset) => boolean): Asset | undefined {
    return release.assets
      .find(filter);
  }

}
