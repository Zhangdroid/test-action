"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path');
const { getNode, getSvgs } = require('./figmaAPI');
const { download } = require('./utils');
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const figmaFileKey = core.getInput('figma_file_key');
            const frameWithIconsId = core.getInput('frame_with_icons_id');
            core.info(`Getting file ${figmaFileKey} with node ${frameWithIconsId}`);
            const svgUrls = yield getFigmaSvgUrls(figmaFileKey, frameWithIconsId);
            yield downloadAllSvgs(svgUrls);
            yield commit();
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
const getFigmaSvgUrls = (fileKey, nodeId) => __awaiter(void 0, void 0, void 0, function* () {
    const nodes = yield getNode(fileKey, nodeId);
    const nodeIds = encodeURIComponent(nodes.map(item => item.id).join(','));
    const imageUrlsWithId = yield getSvgs(fileKey, nodeIds);
    const results = [];
    Object.entries(imageUrlsWithId).map(([key, value]) => {
        const name = nodes.find(_ => _.id === key).name;
        results.push({
            name,
            url: value
        });
    });
    return results;
});
const downloadAllSvgs = svgUrls => {
    const downloadAll = svgUrls.map(item => download({
        name: `${item.name}.svg`,
        url: item.url,
        path: path.resolve(__dirname, 'svg')
    }));
    return Promise.all(downloadAll);
};
const commit = () => __awaiter(void 0, void 0, void 0, function* () {
    yield exec.exec('git', [
        `config --local user.name ${process.env.GITHUB_ACTOR}`
    ]);
    yield exec.exec('git', [
        `config --global user.email '${process.env.GITHUB_ACTOR}@users.noreply.github.com'`
    ]);
    yield exec.exec('git', ['add -A']);
    yield exec.exec('git', ["commit -m '[feat]添加新的 icon'"]);
    yield exec.exec('git', ['push -u origin HEAD']);
});
run();
