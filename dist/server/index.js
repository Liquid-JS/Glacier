"use strict";
const express_1 = require("express");
const fs = require("fs");
const path = require("path");
const BSON = require('bson');
const bson = new BSON();
const defaults = {
    cache: true,
    cacheLife: 1000 * 60 * 60,
    globalData: {}
};
function getSafePath(url) {
    url = (url || '').trim();
    let sURL = path.normalize(url).replace(/\\/gm, '/');
    if (sURL.endsWith('/'))
        sURL = sURL.substr(0, sURL.length - 1);
    let i = 0;
    while (i < sURL.length && (sURL.charAt(i) == '.' || sURL.charAt(i) == '/'))
        i++;
    return sURL.substr(i) || '';
}
exports.getSafePath = getSafePath;
function readFilePromise(file) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, (err, _data) => {
            if (err)
                return reject(err);
            resolve(_data);
        });
    });
}
exports.readFilePromise = readFilePromise;
class Glacier {
    constructor(config) {
        this.config = config;
        this.cache = {};
        this.config = Object.assign({}, defaults, config);
        this.router = express_1.Router();
        this.router.use((req, res, next) => {
            this.getData(req.path)
                .catch(err => next())
                .then((data) => res.render(data.tpl, data))
                .catch(err => next(err));
        });
    }
    getData(urlPath, safe = true) {
        if (safe)
            urlPath = getSafePath(urlPath);
        if (!urlPath)
            urlPath = '__index';
        if (urlPath in this.cache) {
            let d = new Date();
            d.setTime(d.getTime() - this.config['cacheLife']);
            if (this.cache[urlPath].timestamp > d)
                return this.cache[urlPath].dataPromise;
        }
        let pr = readFilePromise(path.join(this.config['path'], urlPath) + '.bson')
            .then(_data => {
            let data = bson.deserialize(_data);
            data.tpl = this.resolveTpl(data);
            return Object.assign({}, this.config['globalData'], data);
        });
        if (this.config['cache'])
            this.cache[urlPath] = {
                timestamp: new Date(),
                dataPromise: pr
            };
        return pr;
    }
    resolveTpl(data) {
        let tpl = data.tpl || '';
        if (!tpl && this.config['tplResolver'])
            tpl = this.config['tplResolver'](data);
        if (!tpl && this.config['defaultTpl'])
            tpl = this.config['defaultTpl'];
        return tpl;
    }
}
exports.Glacier = Glacier;
//# sourceMappingURL=index.js.map