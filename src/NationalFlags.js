var NationalFlags = {
    'zh-cn':require('./images/zh-cn.png'),
    'en':require('./images/en.png')
};


function FindFlags(code) {
    for (var key in NationalFlags) {
        if(key == code)
            return NationalFlags[key];
    }

    return require('./images/zh-cn.png');
}


export {
    FindFlags
};
