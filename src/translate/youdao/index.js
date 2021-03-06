var querystring = require('querystring');
var MD5 = require('../util/md5');
var languages = require('../util/languages');

var host = 'http://openapi.youdao.com/api';
var appid = '6592d42a7135a100';
var key = 'G140kt6jztEPLCZfVDfvxif6I6iK8NrL';

var langs = {
    'auto': 'auto',
    'zh-cn': 'zh-CHS',
    'en': 'EN',
    'ja': 'ja',
    'ko': 'ko',
    'fr': 'fr',
    'ru': 'ru',
    'pt': 'pt',
    'es': 'es'
};

function translate(query, opts) {

    opts = opts || {};

    var e;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(langs, lang)) {
            e = new Error();
            e.code = 400;
            e.message = 'The language \'' + lang + '\' is not supported';
        }
    });
    if (e) {
        return new Promise(function (resolve, reject) {
            reject(e);
        });
    }

    var salt = (new Date).getTime();

    opts.from = opts.from || 'auto';
    opts.to = opts.to || 'en';

    var from = languages.getCode(langs,opts.from);
    var to = languages.getCode(langs,opts.to);

    var str1 = appid + query + salt + key;
    var sign = MD5(str1);

    var data = {
        q: query,
        from: from,
        to: to,
        sign: sign,
        salt: salt,
        appKey: appid,
    };

    return new Promise(function (resolve, reject) {
        fetch(host + '?' + querystring.stringify(data), {timeout: 10000})
            .then(function (res) {
                if (res.status !== 200) {
                    throw new Error('request to ' + host + ' failed, status code = ' + res.status + ' (' + res.statusText + ')');
                }
                return res.text();
            }).then(function (value) {

            try {

                var res = JSON.parse(value);
                if(res.errorCode != 0) {
                    throw new Error('youdao return error code: '+res.errorCode);
                }

                var ls = res.l.split('2');

                var from = ls[0];
                var to = ls[1];

                var result = {
                    text: res.translation[0],
                    from: languages.getCodeByValue(langs, from),
                    to: languages.getCodeByValue(langs, to),
                    raw: '',
                    tts: '',
                    engine: 'Youdao'
                };

                if (opts.raw) {
                    result.raw = res;
                }
                var data = [];
                data.push(result);
                resolve(data);
            } catch (error) {
                reject(error);
            }
        });
    });
}

function isSupported(opts) {

    opts = opts || {};

    var flag = true;
    [opts.from, opts.to].forEach(function (lang) {
        if (lang && !languages.isSupported(langs, lang)) {
            flag = false;
        }
    });
    return flag;
}

module.exports = translate;
module.exports.isSupported = isSupported;