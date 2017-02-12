"use strict";
const river_1 = require("@liquid-js/river");
class Snowball {
    constructor() {
        this._path = [];
        this.children = {};
        this.data = {};
    }
    getName(child) {
        let n = Object.keys(this.children).filter(k => this.children[k] == child);
        if (n.length > 0)
            return n[0];
        return false;
    }
    set parent(parent) {
        let path = [].concat(parent.path, [parent.getName(this)]);
        this._path = path;
        this._parent = parent;
    }
    get parent() {
        return this._parent;
    }
    get container() {
        return Object.keys(this.children).length > 0;
    }
    get path() {
        return this._path;
    }
}
exports.Snowball = Snowball;
class GlacierBuilder {
    constructor(root, basePath) {
        this.root = root;
        this.basePath = basePath;
        this.extraFiles = [];
    }
    forEach(callback, root = this.root) {
        Object.keys(root.children).forEach(k => this.forEach(callback, root.children[k]));
        callback(root);
    }
    getFilePath(ball, file) {
        return river_1.lazyImport('path')
            .then(imp => {
            let path = imp[0];
            let fp = '';
            if (file.startsWith('/'))
                fp = path.join(this.basePath, file.substr(1));
            else
                fp = path.join(this.basePath, (ball.parent || { path: [] }).path.join('/'), file);
            return fp;
        });
    }
    getFile(ball, file, subdir) {
        return this.getFilePath(ball, file)
            .then(fp => river_1.lazyImport('fs', 'vinyl', 'crypto', 'path')
            .then(imp => {
            let fs = imp[0];
            let _file = imp[1];
            let crypto = imp[2];
            let path = imp[3];
            let ext = path.extname(fp);
            let hash = crypto.createHmac('md5', path.relative(this.basePath, fp).replace(new RegExp('\\' + path.sep, 'g'), '/')).digest('hex');
            let np = fp;
            if (subdir) {
                np = path.join(this.basePath, subdir, hash + ext);
            }
            else {
                np = path.join(this.basePath, hash + ext);
            }
            let ex = this.extraFiles.filter(file => file.path == np);
            if (ex.length)
                return Promise.resolve(ex[0]);
            return new Promise((resolve, reject) => {
                fs.readFile(fp, (err, buff) => {
                    if (err)
                        return reject(err);
                    let file = new _file({
                        base: this.basePath,
                        path: np,
                        contents: buff
                    });
                    resolve(file);
                });
            });
        }));
    }
}
exports.GlacierBuilder = GlacierBuilder;
let regex = new RegExp("[\0-/:-@\[-`\{-\xA9\xAB-\xB4\xB6-\xB9\xBB-\xBF\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u0344\u0346-\u036F\u0375\u0378\u0379\u037E\u0380-\u0385\u0387\u038B\u038D\u03A2\u03F6\u0482-\u0489\u0530\u0557\u0558\u055A-\u0560\u0588-\u05AF\u05BE\u05C0\u05C3\u05C6\u05C8-\u05CF\u05EB-\u05EF\u05F3-\u060F\u061B-\u061F\u0658\u0660-\u066D\u06D4\u06DD-\u06E0\u06E9-\u06EC\u06F0-\u06F9\u06FD\u06FE\u0700-\u070F\u0740-\u074C\u07B2-\u07C9\u07EB-\u07F3\u07F6-\u07F9\u07FB-\u07FF\u0818\u0819\u082D-\u083F\u0859-\u089F\u08B5\u08BE-\u08D3\u08E0-\u08E2\u08EA-\u08EF\u093C\u094D\u0951-\u0954\u0964-\u0970\u0984\u098D\u098E\u0991\u0992\u09A9\u09B1\u09B3-\u09B5\u09BA-\u09BC\u09C5\u09C6\u09C9\u09CA\u09CD\u09CF-\u09D6\u09D8-\u09DB\u09DE\u09E4-\u09EF\u09F2-\u0A00\u0A04\u0A0B-\u0A0E\u0A11\u0A12\u0A29\u0A31\u0A34\u0A37\u0A3A-\u0A3D\u0A43-\u0A46\u0A49\u0A4A\u0A4D-\u0A50\u0A52-\u0A58\u0A5D\u0A5F-\u0A6F\u0A76-\u0A80\u0A84\u0A8E\u0A92\u0AA9\u0AB1\u0AB4\u0ABA-\u0ABC\u0AC6\u0ACA\u0ACD-\u0ACF\u0AD1-\u0ADF\u0AE4-\u0AF8\u0AFA-\u0B00\u0B04\u0B0D\u0B0E\u0B11\u0B12\u0B29\u0B31\u0B34\u0B3A-\u0B3C\u0B45\u0B46\u0B49\u0B4A\u0B4D-\u0B55\u0B58-\u0B5B\u0B5E\u0B64-\u0B70\u0B72-\u0B81\u0B84\u0B8B-\u0B8D\u0B91\u0B96-\u0B98\u0B9B\u0B9D\u0BA0-\u0BA2\u0BA5-\u0BA7\u0BAB-\u0BAD\u0BBA-\u0BBD\u0BC3-\u0BC5\u0BC9\u0BCD-\u0BCF\u0BD1-\u0BD6\u0BD8-\u0BFF\u0C04\u0C0D\u0C11\u0C29\u0C3A-\u0C3C\u0C45\u0C49\u0C4D-\u0C54\u0C57\u0C5B-\u0C5F\u0C64-\u0C7F\u0C84\u0C8D\u0C91\u0CA9\u0CB4\u0CBA-\u0CBC\u0CC5\u0CC9\u0CCD-\u0CD4\u0CD7-\u0CDD\u0CDF\u0CE4-\u0CF0\u0CF3-\u0D00\u0D04\u0D0D\u0D11\u0D3B\u0D3C\u0D45\u0D49\u0D4D\u0D4F-\u0D53\u0D58-\u0D5E\u0D64-\u0D79\u0D80\u0D81\u0D84\u0D97-\u0D99\u0DB2\u0DBC\u0DBE\u0DBF\u0DC7-\u0DCE\u0DD5\u0DD7\u0DE0-\u0DF1\u0DF4-\u0E00\u0E3B-\u0E3F\u0E47-\u0E4C\u0E4E-\u0E80\u0E83\u0E85\u0E86\u0E89\u0E8B\u0E8C\u0E8E-\u0E93\u0E98\u0EA0\u0EA4\u0EA6\u0EA8\u0EA9\u0EAC\u0EBA\u0EBE\u0EBF\u0EC5\u0EC7-\u0ECC\u0ECE-\u0EDB\u0EE0-\u0EFF\u0F01-\u0F3F\u0F48\u0F6D-\u0F70\u0F82-\u0F87\u0F98\u0FBD-\u0FFF\u1037\u1039\u103A\u1040-\u104F\u1063\u1064\u1069-\u106D\u1087-\u108D\u108F-\u109B\u109E\u109F\u10C6\u10C8-\u10CC\u10CE\u10CF\u10FB\u1249\u124E\u124F\u1257\u1259\u125E\u125F\u1289\u128E\u128F\u12B1\u12B6\u12B7\u12BF\u12C1\u12C6\u12C7\u12D7\u1311\u1316\u1317\u135B-\u135E\u1360-\u137F\u1390-\u139F\u13F6\u13F7\u13FE-\u1400\u166D\u166E\u1680\u169B-\u169F\u16EB-\u16ED\u16F9-\u16FF\u170D\u1714-\u171F\u1734-\u173F\u1754-\u175F\u176D\u1771\u1774-\u177F\u17B4\u17B5\u17C9-\u17D6\u17D8-\u17DB\u17DD-\u181F\u1878-\u187F\u18AB-\u18AF\u18F6-\u18FF\u191F\u192C-\u192F\u1939-\u194F\u196E\u196F\u1975-\u197F\u19AC-\u19AF\u19CA-\u19FF\u1A1C-\u1A1F\u1A5F\u1A60\u1A75-\u1AA6\u1AA8-\u1AFF\u1B34\u1B44\u1B4C-\u1B7F\u1BAA\u1BAB\u1BB0-\u1BB9\u1BE6\u1BF2-\u1BFF\u1C36-\u1C4C\u1C50-\u1C59\u1C7E\u1C7F\u1C89-\u1CE8\u1CED\u1CF4\u1CF7-\u1CFF\u1DC0-\u1DE6\u1DF5-\u1DFF\u1F16\u1F17\u1F1E\u1F1F\u1F46\u1F47\u1F4E\u1F4F\u1F58\u1F5A\u1F5C\u1F5E\u1F7E\u1F7F\u1FB5\u1FBD\u1FBF-\u1FC1\u1FC5\u1FCD-\u1FCF\u1FD4\u1FD5\u1FDC-\u1FDF\u1FED-\u1FF1\u1FF5\u1FFD-\u2070\u2072-\u207E\u2080-\u208F\u209D-\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F-\u215F\u2189-\u24B5\u24EA-\u2BFF\u2C2F\u2C5F\u2CE5-\u2CEA\u2CEF-\u2CF1\u2CF4-\u2CFF\u2D26\u2D28-\u2D2C\u2D2E\u2D2F\u2D68-\u2D6E\u2D70-\u2D7F\u2D97-\u2D9F\u2DA7\u2DAF\u2DB7\u2DBF\u2DC7\u2DCF\u2DD7\u2DDF\u2E00-\u2E2E\u2E30-\u3004\u3008-\u3020\u302A-\u3030\u3036\u3037\u303D-\u3040\u3097-\u309C\u30A0\u30FB\u3100-\u3104\u312E-\u3130\u318F-\u319F\u31BB-\u31EF\u3200-\u33FF\u4DB6-\u4DFF\u9FD6-\u9FFF\uA48D-\uA4CF\uA4FE\uA4FF\uA60D-\uA60F\uA620-\uA629\uA62C-\uA63F\uA66F-\uA673\uA67C-\uA67E\uA6F0-\uA716\uA720\uA721\uA789\uA78A\uA7AF\uA7B8-\uA7F6\uA802\uA806\uA80B\uA828-\uA83F\uA874-\uA87F\uA8C4\uA8C6-\uA8F1\uA8F8-\uA8FA\uA8FC\uA8FE-\uA909\uA92B-\uA92F\uA953-\uA95F\uA97D-\uA97F\uA9B3\uA9C0-\uA9CE\uA9D0-\uA9DF\uA9E5\uA9F0-\uA9F9\uA9FF\uAA37-\uAA3F\uAA4E-\uAA5F\uAA77-\uAA79\uAA7B-\uAA7D\uAABF\uAAC1\uAAC3-\uAADA\uAADE\uAADF\uAAF0\uAAF1\uAAF6-\uAB00\uAB07\uAB08\uAB0F\uAB10\uAB17-\uAB1F\uAB27\uAB2F\uAB5B\uAB66-\uAB6F\uABEB-\uABFF\uD7A4-\uD7AF\uD7C7-\uD7CA\uD7FC-\uF8FF\uFA6E\uFA6F\uFADA-\uFAFF\uFB07-\uFB12\uFB18-\uFB1C\uFB29\uFB37\uFB3D\uFB3F\uFB42\uFB45\uFBB2-\uFBD2\uFD3E-\uFD4F\uFD90\uFD91\uFDC8-\uFDEF\uFDFC-\uFE6F\uFE75\uFEFD-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65\uFFBF-\uFFC1\uFFC8\uFFC9\uFFD0\uFFD1\uFFD8\uFFD9\uFFDD-\uFFFF\u{1000C}\u{10027}\u{1003B}\u{1003E}\u{1004E}\u{1004F}\u{1005E}-\u{1007F}\u{100FB}-\u{1013F}\u{10175}-\u{1027F}\u{1029D}-\u{1029F}\u{102D1}-\u{102FF}\u{10320}-\u{1032F}\u{1034B}-\u{1034F}\u{1037B}-\u{1037F}\u{1039E}\u{1039F}\u{103C4}-\u{103C7}\u{103D0}\u{103D6}-\u{103FF}\u{1049E}-\u{104AF}\u{104D4}-\u{104D7}\u{104FC}-\u{104FF}\u{10528}-\u{1052F}\u{10564}-\u{105FF}\u{10737}-\u{1073F}\u{10756}-\u{1075F}\u{10768}-\u{107FF}\u{10806}\u{10807}\u{10809}\u{10836}\u{10839}-\u{1083B}\u{1083D}\u{1083E}\u{10856}-\u{1085F}\u{10877}-\u{1087F}\u{1089F}-\u{108DF}\u{108F3}\u{108F6}-\u{108FF}\u{10916}-\u{1091F}\u{1093A}-\u{1097F}\u{109B8}-\u{109BD}\u{109C0}-\u{109FF}\u{10A04}\u{10A07}-\u{10A0B}\u{10A14}\u{10A18}\u{10A34}-\u{10A5F}\u{10A7D}-\u{10A7F}\u{10A9D}-\u{10ABF}\u{10AC8}\u{10AE5}-\u{10AFF}\u{10B36}-\u{10B3F}\u{10B56}-\u{10B5F}\u{10B73}-\u{10B7F}\u{10B92}-\u{10BFF}\u{10C49}-\u{10C7F}\u{10CB3}-\u{10CBF}\u{10CF3}-\u{10FFF}\u{11046}-\u{11081}\u{110B9}-\u{110CF}\u{110E9}-\u{110FF}\u{11133}-\u{1114F}\u{11173}-\u{11175}\u{11177}-\u{1117F}\u{111C0}\u{111C5}-\u{111D9}\u{111DB}\u{111DD}-\u{111FF}\u{11212}\u{11235}\u{11236}\u{11238}-\u{1123D}\u{1123F}-\u{1127F}\u{11287}\u{11289}\u{1128E}\u{1129E}\u{112A9}-\u{112AF}\u{112E9}-\u{112FF}\u{11304}\u{1130D}\u{1130E}\u{11311}\u{11312}\u{11329}\u{11331}\u{11334}\u{1133A}-\u{1133C}\u{11345}\u{11346}\u{11349}\u{1134A}\u{1134D}-\u{1134F}\u{11351}-\u{11356}\u{11358}-\u{1135C}\u{11364}-\u{113FF}\u{11442}\u{11446}\u{1144B}-\u{1147F}\u{114C2}\u{114C3}\u{114C6}\u{114C8}-\u{1157F}\u{115B6}\u{115B7}\u{115BF}-\u{115D7}\u{115DE}-\u{115FF}\u{1163F}\u{11641}-\u{11643}\u{11645}-\u{1167F}\u{116B6}-\u{116FF}\u{1171A}-\u{1171C}\u{1172B}-\u{1189F}\u{118E0}-\u{118FE}\u{11900}-\u{11ABF}\u{11AF9}-\u{11BFF}\u{11C09}\u{11C37}\u{11C3F}\u{11C41}-\u{11C71}\u{11C90}\u{11C91}\u{11CA8}\u{11CB7}-\u{11FFF}\u{1239A}-\u{123FF}\u{1246F}-\u{1247F}\u{12544}-\u{12FFF}\u{1342F}-\u{143FF}\u{14647}-\u{167FF}\u{16A39}-\u{16A3F}\u{16A5F}-\u{16ACF}\u{16AEE}-\u{16AFF}\u{16B37}-\u{16B3F}\u{16B44}-\u{16B62}\u{16B78}-\u{16B7C}\u{16B90}-\u{16EFF}\u{16F45}-\u{16F4F}\u{16F7F}-\u{16F92}\u{16FA0}-\u{16FDF}\u{16FE1}-\u{16FFF}\u{187ED}-\u{187FF}\u{18AF3}-\u{1AFFF}\u{1B002}-\u{1BBFF}\u{1BC6B}-\u{1BC6F}\u{1BC7D}-\u{1BC7F}\u{1BC89}-\u{1BC8F}\u{1BC9A}-\u{1BC9D}\u{1BC9F}-\u{1D3FF}\u{1D455}\u{1D49D}\u{1D4A0}\u{1D4A1}\u{1D4A3}\u{1D4A4}\u{1D4A7}\u{1D4A8}\u{1D4AD}\u{1D4BA}\u{1D4BC}\u{1D4C4}\u{1D506}\u{1D50B}\u{1D50C}\u{1D515}\u{1D51D}\u{1D53A}\u{1D53F}\u{1D545}\u{1D547}-\u{1D549}\u{1D551}\u{1D6A6}\u{1D6A7}\u{1D6C1}\u{1D6DB}\u{1D6FB}\u{1D715}\u{1D735}\u{1D74F}\u{1D76F}\u{1D789}\u{1D7A9}\u{1D7C3}\u{1D7CC}-\u{1DFFF}\u{1E007}\u{1E019}\u{1E01A}\u{1E022}\u{1E025}\u{1E02B}-\u{1E7FF}\u{1E8C5}-\u{1E8FF}\u{1E944}-\u{1E946}\u{1E948}-\u{1EDFF}\u{1EE04}\u{1EE20}\u{1EE23}\u{1EE25}\u{1EE26}\u{1EE28}\u{1EE33}\u{1EE38}\u{1EE3A}\u{1EE3C}-\u{1EE41}\u{1EE43}-\u{1EE46}\u{1EE48}\u{1EE4A}\u{1EE4C}\u{1EE50}\u{1EE53}\u{1EE55}\u{1EE56}\u{1EE58}\u{1EE5A}\u{1EE5C}\u{1EE5E}\u{1EE60}\u{1EE63}\u{1EE65}\u{1EE66}\u{1EE6B}\u{1EE73}\u{1EE78}\u{1EE7D}\u{1EE7F}\u{1EE8A}\u{1EE9C}-\u{1EEA0}\u{1EEA4}\u{1EEAA}\u{1EEBC}-\u{1F12F}\u{1F14A}-\u{1F14F}\u{1F16A}-\u{1F16F}\u{1F18A}-\u{1FFFF}\u{2A6D7}-\u{2A6FF}\u{2B735}-\u{2B73F}\u{2B81E}\u{2B81F}\u{2CEA2}-\u{2F7FF}\u{2FA1E}-\u{10FFFF}]+", 'iug');
function cleanAliasPart(part) {
    return part.toLowerCase().replace(regex, '-').replace(/(^-+)|(-+$)/g, '');
}
exports.cleanAliasPart = cleanAliasPart;
function snowstorm(_options) {
    let options = Object.assign({}, _options);
    return (files) => {
        return river_1.lazyImport('fs', 'bson', 'path')
            .then(imp => {
            let fs = imp[0];
            let bson = new imp[1]();
            let path = imp[2];
            let balls = [];
            let drops = [];
            files.forEach(file => {
                let content = {};
                try {
                    content = bson.deserialize(file.contents);
                }
                catch (e) {
                    try {
                        content = JSON.parse(file.contents.toString());
                    }
                    catch (e1) {
                    }
                }
                if (Object.keys(content).length > 0) {
                    balls.push({
                        file: file,
                        content: content
                    });
                }
                else {
                    drops.push(file);
                }
            });
            let base = __dirname;
            let bases = balls.map(ball => ball.file.base).sort();
            if (bases.length) {
                let fr = bases[0];
                let ls = bases[bases.length - 1];
                let l = Math.min(fr.length, ls.length);
                let i = 0;
                while (i < l && fr[i] == ls[i])
                    i++;
                base = fr.substr(0, i);
            }
            let root = new Snowball();
            let glacier = new GlacierBuilder(root, base);
            glacier.extraFiles = drops;
            return Promise.all([].concat(...balls.map(ball => Object.keys(ball.content)
                .filter(k => k.match(/[a-z]File$/))
                .map(k => new Promise((resolve, reject) => {
                let fp = '';
                if (ball.content[k].startsWith('/'))
                    fp = path.join(glacier.basePath, ball.content[k].substr(1));
                else
                    fp = path.join(path.dirname(ball.file.path), ball.content[k]);
                fs.readFile(fp, 'utf8', (err, data) => {
                    if (err)
                        return reject(err);
                    let nk = k.substr(0, k.length - 4);
                    ball.content[nk] = data;
                    delete ball.content[k];
                    resolve();
                });
            })))))
                .then(() => {
                balls.forEach(ball => {
                    let pt = path
                        .relative(glacier.basePath, ball.file.path)
                        .split(path.sep)
                        .filter(part => part != '..' && part != '.')
                        .map((part) => part.toLowerCase().endsWith('.json') || part.toLowerCase().endsWith('.bson') ? part.substr(0, part.length - 5) : part)
                        .map(part => part == '__index' ? '' : part)
                        .filter(part => !!part);
                    let r = root;
                    for (let i = 0; i < pt.length; i++) {
                        if (!(pt[i] in r.children)) {
                            r.children[pt[i]] = new Snowball();
                            r.children[pt[i]].parent = r;
                        }
                        r = r.children[pt[i]];
                    }
                    r.data = ball.content;
                });
                return glacier;
            });
        });
    };
}
exports.snowstorm = snowstorm;
function meltdown(_options) {
    let options = Object.assign({
        staticPath: '__ext'
    }, _options);
    return (glacier) => {
        return river_1.lazyImport('vinyl', 'bson', 'path')
            .then(imp => {
            let _file = imp[0];
            let bson = new imp[1]();
            let path = imp[2];
            let cwd = process.cwd();
            let files = [];
            glacier.forEach((node) => {
                let pt = node.path
                    .map(part => cleanAliasPart(part))
                    .filter(part => !!part)
                    .join(path.sep);
                if (!pt)
                    pt = '__index';
                pt += '.bson';
                files.push(new _file({
                    cwd: cwd,
                    base: glacier.basePath,
                    path: path.join(glacier.basePath, pt),
                    contents: bson.serialize(node.data)
                }));
            });
            glacier.extraFiles.forEach(file => {
                let pt = path.relative(glacier.basePath, file.path)
                    .split(path.sep)
                    .filter(part => part != '..' && part != '.')
                    .join(path.sep);
                file.cwd = cwd;
                file.base = glacier.basePath;
                file.path = path.join(glacier.basePath, options.staticPath, pt);
                files.push(file);
            });
            return files;
        });
    };
}
exports.meltdown = meltdown;
//# sourceMappingURL=index.js.map