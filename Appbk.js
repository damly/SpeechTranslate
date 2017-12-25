/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    ToastAndroid,
    StyleSheet,
    View,
    Text,
    Button,
    Platform,
    DeviceEventEmitter
} from 'react-native';

import {Recognizer, Synthesizer, SpeechConstant} from "react-native-speech-iflytek";
import ModalDropdown from 'react-native-modal-dropdown';

import ImagePicker from 'react-native-image-picker';
import RNTesseractOcr from 'react-native-tesseract-ocr';

var translate = require('./translate');

const LAG_OPTIONS =  ['谷歌翻译', '百度翻译', '有道翻译'];
const LAG_VALUE =  ['google', 'baidu', 'youdao'];

export default class App extends Component<{}> {

    constructor(props) {
        super(props);

        this.state = {
            title:"google",
            select: 0,
            text: "识别",
            trans: "翻译",
            from: "zh_cn",
            to: "en",
            recordBtnText: "Press to record"
        };

        this.onRecognizerResult = this.onRecognizerResult.bind(this);
    }

    componentDidMount() {
        Recognizer.init("57e66aab");
        Synthesizer.init("57e66aab");
        DeviceEventEmitter.addListener("onRecognizerResult", this.onRecognizerResult);
    }

    componentWillUnmount() {
        DeviceEventEmitter.removeListener("onRecognizerResult", this.onRecognizerResult);
    }

    onRecognizerResult(e) {
        if (!e.isLast) {
            return;
        }

        console.log(e);
        this.setState({text: e.result});
    }

    onToEnStart() {
        ToastAndroid.show("正在识别中文...", ToastAndroid.SHORT);

        this.state.from = "zh_cn";
        this.state.to = "en";
        this.setRecognizerParam();
        Recognizer.start();
    }

    onToZhStart() {
        ToastAndroid.show("正在识别英文...", ToastAndroid.SHORT);
        this.state.from = "en";
        this.state.to = "zh_cn";
        this.setRecognizerParam();
        Recognizer.start();
    }

    onRecognizerResult(e) {
        if (!e.isLast) {
            return;
        }

        let that = this;

        let from,to;
        if(this.state.from == 'zh_cn') {
            from='zh-cn';
            to='en';
        }
        else {
            from='en';
            to='zh-cn';
        }

        translate(e.result, {from: from, to: to, engine: LAG_VALUE[this.state.select]}).then(function (result) {
            that.onSyntheSpeak();
            that.setState({trans: result[0].text});
        }).catch(function (err) {
            alert(err.message)
        });

        this.setState({text: e.result});
    }

    setRecognizerParam() {
        // 清空参数
        Recognizer.setParameter(SpeechConstant.PARAMS, null);
        // 设置听写引擎
        Recognizer.setParameter(SpeechConstant.ENGINE_TYPE, SpeechConstant.TYPE_CLOUD);

        // 设置返回结果格式
        Recognizer.setParameter(SpeechConstant.RESULT_TYPE, "json");

        if(this.state.from == 'zh_cn') {
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

    setTtsParam() {

        Synthesizer.setParameter(SpeechConstant.ENGINE_TYPE, SpeechConstant.TYPE_CLOUD);
        // 设置在线合成发音人
        if(this.state.to == 'zh_cn') {
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

    async onSyntheSpeak() {
        let isSpeaking = await Synthesizer.isSpeaking();

        this.setTtsParam();

        isSpeaking ? Synthesizer.stop() : Synthesizer.start(this.state.trans);
    }

    onOcrStart(){
        const options = {
            title:'选择图片',
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                var source;

                if (Platform.OS === 'android') {
                    source = {uri: response.uri, isStatic: true};
                } else {
                    source = {uri: response.uri.replace('file://', ''), isStatic: true};
                }

                this.setState({ imgSource: source });

                RNTesseractOcr.startOcr(response.path, "LANG_CHINESE_SIMPLIFIED")
                    .then((result) => {
                        this.setState({ text: result });
                        console.log("OCR Result: ", result);
                    })
                    .catch((err) => {
                        console.log("OCR Error: ", err);
                    })
                    .done();
            }
        });
    }


    onSelected(idx, value) {
        this.state.select = idx;
    }

    render() {
        return (
            <View style={styles.container} onStartShouldSetResponder={() => true}>
                <View style={{height:47,paddingLeft:5,backgroundColor: "gray",justifyContent:"center",flexDirection:'row'}}>
                    <ModalDropdown textStyle={{fontSize:20}}
                                   defaultIndex={0}
                                   defaultValue={'谷歌翻译'}
                                   dropdownTextStyle={{fontSize:20}}
                                   options={LAG_OPTIONS}
                                   onSelect={(idx, value) => this.onSelected(idx, value)}/>
                    <Text  style={{fontSize: 12, marginLeft: 5}}>点击切换引擎</Text>
                </View>
                <View style={{flex: 1, borderColor: "red", borderWidth: 2, margin: 5}}>
                    <Text style={{flex: 1, fontSize: 20, margin: 5}}>{this.state.text}</Text>
                </View>
                <View style={{flex: 1, borderColor: "red", borderWidth: 2, margin: 5}}>
                    <Text style={{flex: 1, fontSize: 20, margin: 5}}>{this.state.trans}</Text>
                </View>

                <View style={{flexDirection: 'row', padding: 10, justifyContent: "center",}}>
                    <View style={{flexDirection: 'row', margin: 10, justifyContent: "center",}}>
                        <Button
                            onPress={this.onToEnStart.bind(this)}
                            title="中文=>英文"
                        />
                    </View>
                    <View style={{flexDirection: 'row', margin: 10, justifyContent: "center",}}>
                        <Button
                            onPress={this.onToZhStart.bind(this)}
                            title="英文=>中文"
                        />
                    </View>
                    <View style={{flexDirection: 'row', margin: 10, justifyContent: "center",}}>
                        <Button
                            onPress={this.onOcrStart.bind(this)}
                            title="Ocr识别"
                        />
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "stretch",
        padding: 5
    },
    result: {
        fontSize: 20,
        textAlign: "center",
        margin: 10
    },
    containerStyle: {
        backgroundColor: "#0275d8",
        margin: 4,
        padding: 4,
        borderRadius: 2
    }
});
