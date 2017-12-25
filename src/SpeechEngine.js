import {
    DeviceEventEmitter
} from "react-native";

import {
    Recognizer,
    Synthesizer,
    SpeechConstant
} from "react-native-speech-iflytek";

class SpeechEngine {

    constructor() {
        this.state = {
            from: 'zh-cn',
            to: 'en'
        };

        this._onRecognizerResult = this._onRecognizerResult.bind(this);
        this._onRecognizerVolumeChanged = this._onRecognizerVolumeChanged.bind(this);

        Recognizer.init("57e66aab");
        Synthesizer.init("57e66aab");
        DeviceEventEmitter.addListener("onRecognizerResult", this._onRecognizerResult);
        DeviceEventEmitter.addListener("onRecognizerVolumeChanged", this._onRecognizerVolumeChanged);

        this.callbacks = {
            'result': null,
            'volume': null
        };
    }

    destroy() {
        DeviceEventEmitter.removeListener("onRecognizerResult", this._onRecognizerResult);
        DeviceEventEmitter.addListener("onRecognizerVolumeChanged", this._onRecognizerVolumeChanged);
    }

    listen(value, callback) {
        for (var key in this.callbacks) {
            if(key == value) {
                this.callbacks[key] = callback;
            }
        }
    }

    starRecognizer(from, to) {

        this.state.from = from;
        this.state.to = to;

        console.log(this.state);

        this._setRecognizerParam(from);
        Recognizer.start();
    }

    stopRecognizer() {
        Recognizer.stop();
    }

    async startSpeak(lag, text) {
        let isSpeaking = await Synthesizer.isSpeaking();

        this._setTtsParam(lag);

        isSpeaking ? Synthesizer.stop() : Synthesizer.start(text);
    }

    _onRecognizerResult(e) {

        console.log('_onRecognizerResult', e);

        if (!e.isLast) {
            return;
        }

        console.log('_onRecognizerResult', e);

        let text = e.result;
        let that = this;
        translate(text, {from: that.state.from, to: that.state.to, engine: 'auto'}).then(function (result) {
            that.startSpeak(to, result[0].text);
            if (typeof that.callbacks['result'] === 'function') {
                let res = {
                    from: {
                        lag:that.state.from,
                        text:text
                    },
                    to:{
                        lag:that.state.to,
                        text:result[0].text
                    }
                };

                that.callbacks['result'](res);
            }
        });
    }

    _onRecognizerVolumeChanged() {

        console.log('_onRecognizerVolumeChanged');

        if (typeof this.callbacks['volume'] === 'function') {
            this.callbacks['volume']();
        }
    }

    _setRecognizerParam(lag) {
        // 清空参数
        Recognizer.setParameter(SpeechConstant.PARAMS, null);
        // 设置听写引擎
        Recognizer.setParameter(SpeechConstant.ENGINE_TYPE, SpeechConstant.TYPE_CLOUD);

        // 设置返回结果格式
        Recognizer.setParameter(SpeechConstant.RESULT_TYPE, "json");

        if (lag == 'zh-cn') {
            // 设置语言
            Recognizer.setParameter(SpeechConstant.LANGUAGE, "zh_cn");
            // 设置语言区域
            Recognizer.setParameter(SpeechConstant.ACCENT, "zh_cn");
        }
        else {
            // 设置语言
            Recognizer.setParameter(SpeechConstant.LANGUAGE, "en_us");
        }

        // 设置语音前端点:静音超时时间，即用户多长时间不说话则当做超时处理
        Recognizer.setParameter(SpeechConstant.VAD_BOS, "4000");

        // 设置语音后端点:后端点静音检测时间，即用户停止说话多长时间内即认为不再输入， 自动停止录音
        Recognizer.setParameter(SpeechConstant.VAD_EOS, "1000");

        // 设置标点符号,设置为"0"返回结果无标点,设置为"1"返回结果有标点
        Recognizer.setParameter(SpeechConstant.ASR_PTT, "1");

        // 设置音频保存路径，保存音频格式支持pcm、wav，设置路径为sd卡请注意WRITE_EXTERNAL_STORAGE权限
        // 注：AUDIO_FORMAT参数语记需要更新版本才能生效
        Recognizer.setParameter(SpeechConstant.AUDIO_FORMAT, "wav");
        Recognizer.setParameter(SpeechConstant.ASR_AUDIO_PATH, "/App/SpeechRecognizer");
    }

    _setTtsParam(lag) {

        Synthesizer.setParameter(SpeechConstant.ENGINE_TYPE, SpeechConstant.TYPE_CLOUD);
        // 设置在线合成发音人
        if (lag == 'zh-cn') {
            Synthesizer.setParameter(SpeechConstant.VOICE_NAME, "xiaoyan");
        }
        else {
            Synthesizer.setParameter(SpeechConstant.VOICE_NAME, "catherine");
        }
        //设置合成语速
        Synthesizer.setParameter(SpeechConstant.SPEED, "50");
        //设置合成音调
        Synthesizer.setParameter(SpeechConstant.PITCH, "50");
        //设置合成音量
        Synthesizer.setParameter(SpeechConstant.VOLUME, "50");

        //设置播放器音频流类型
        Synthesizer.setParameter(SpeechConstant.STREAM_TYPE, "3");
        // 设置播放合成音频打断音乐播放，默认为true
        Synthesizer.setParameter(SpeechConstant.KEY_REQUEST_FOCUS, "true");
    }
}

export default SpeechEngine;