const core = require('@actions/core');
const exec = require('@actions/exec');
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
  const downloadAll = svgUrls.map(item =>
    download({
      name: `${item.name}.svg`,
      url: item.url,
      path: path.resolve(process.env.GITHUB_WORKSPACE, 'svg')
    })
  );
  return Promise.all(downloadAll);
};

const commit = async () => {
  await exec.exec('git', [
    `config --local user.name ${process.env.GITHUB_ACTOR}`
  ]);
  await exec.exec('git', [
    `config --global user.email '${process.env.GITHUB_ACTOR}@users.noreply.github.com'`
  ]);
  await exec.exec('git', ['add -A']);
  await exec.exec('git', ["commit -m '[feat]添加新的 icon'"]);
  await exec.exec('git', ['push -u origin HEAD']);
};

run();
