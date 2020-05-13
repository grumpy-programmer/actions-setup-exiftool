import * as core from '@actions/core';
import * as cache from '@actions/tool-cache';
import { FileSystem } from './file-system';
import { GithubService } from './github';

async function run() {

  const github = new GithubService();

  const inputVersion = core.getInput('version', { required: true });

  core.info('version: ' + inputVersion);

  const tag = await github.getTag('exiftool', 'exiftool', inputVersion);

  if (tag === undefined) {
    core.error(`version '${inputVersion}' not found`);
    return;
  }

  const version = `0.${tag.name}`;

  const cachePath = cache.find('exiftool', version);

  if (cachePath !== '') {
    core.info('loaded from cache');
    core.addPath(cachePath);
    return;
  }

  core.info('not found in cache');

  const url = tag.tarball_url;

  core.info('download from ' + url);
  const downloadPath = await cache.downloadTool(url);
  core.info('downloaded to ' + downloadPath);

  const extractedPath = await cache.extractTar(downloadPath);

  core.info('extracted to ' + extractedPath);

  const path = FileSystem.findSubPath(extractedPath, path => path.startsWith('exiftool-exiftool-'));

  if (path === undefined) {
    core.error('could not found path');
    return;
  }

  const file = `${path}/exiftool`;

  FileSystem.chmod(file);

  const savedCachePath = await cache.cacheDir(path, 'exiftool', version);

  core.info('cache saved to ' + savedCachePath);

  core.addPath(savedCachePath);
}


run()
  .catch(e => core.error(e));

