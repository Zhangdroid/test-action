import {error} from '@actions/core';

const core = require('@actions/core');
const {exec} = require('child_process');
const path = require('path');

const {getNode, getSvgs} = require('./figmaAPI');
const {download} = require('./utils');

async function run() {
  try {
    const figmaFileKey = core.getInput('figma_file_key');
    const frameWithIconsId = core.getInput('frame_with_icons_id');
    core.info(`Getting file ${figmaFileKey} with node ${frameWithIconsId}`);
    const svgUrls = await getFigmaSvgUrls(figmaFileKey, frameWithIconsId);
    await downloadAllSvgs(svgUrls);
    await commit();
  } catch (error) {
    core.setFailed(error.message);
  }
}

const getFigmaSvgUrls = async (fileKey, nodeId) => {
  const nodes = await getNode(fileKey, nodeId);
  const nodeIds = encodeURIComponent(nodes.map(item => item.id).join(','));
  const imageUrlsWithId = await getSvgs(fileKey, nodeIds);
  const results: {name: string; url: unknown}[] = [];
  Object.entries(imageUrlsWithId).map(([key, value]) => {
    const name = nodes.find(_ => _.id === key).name;
    results.push({
      name,
      url: value
    });
  });
  return results;
};

const downloadAllSvgs = svgUrls => {
  core.info(`path: ${path.resolve(process.env.GITHUB_WORKSPACE, 'svg')}`);
  const downloadAll = svgUrls.map(item =>
    download({
      name: `${item.name}.svg`,
      url: item.url,
      path: path.resolve(process.env.GITHUB_WORKSPACE, 'svg')
    })
  );
  return Promise.all(downloadAll);
};

const commit = () => {
  return new Promise((resolve, reject) => {
    exec(
      `git config --global user.name '${process.env.GITHUB_ACTOR}' \\
      && git config --global user.email '${process.env.GITHUB_ACTOR}@users.noreply.github.com' \\
      && git add -A && git commit -m '$*' --allow-empty \\
      && git push -u origin HEAD`,
      error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};

run();
