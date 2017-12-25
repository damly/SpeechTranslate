import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    AsyncStorage,
    TouchableOpacity,
    DeviceEventEmitter
} from 'react-native';

var Sound = require('react-native-sound');

import {
    GiftedChat,
    Bubble,
    SystemMessage,
    LoadEarlier
} from './components/chat';

import Icon from 'react-native-vector-icons/Ionicons';

import {
    Recognizer,
    Synthesizer,
    SpeechConstant
} from "react-native-speech-iflytek";

import Modal from 'react-native-modalbox';

import {FindFlags} from './NationalFlags';

import translate from './translate';

import VolumeView from './VolumeView';

class TransView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            loadEarlier: true,
            isLoadingEarlier: false,
            current: null,
            typing:false,
            level:0
        };

        this.left = {
            from: 'zh-cn',
            to: 'en'
        };
        this.right = {
            from: 'en',
            to: 'zh-cn'
        };

        this._isMounted = false;
        this.renderBubble = this.renderBubble.bind(this);
        this.renderSystemMessage = this.renderSystemMessage.bind(this);
        this.onLoadEarlier = this.onLoadEarlier.bind(this);

        this.onInputIn = this.onInputIn.bind(this);
        this.onInputOut = this.onInputOut.bind(this);

        this.onSpeachResult = this.onSpeachResult.bind(this);
        
        this.onRecognizerResult = this.onRecognizerResult.bind(this);
        this.onRecognizerVolumeChanged = this.onRecognizerVolumeChanged.bind(this);
    }

    componentWillMount() {
        this._isMounted = true;
        this.onLoadEarlier();
        Recognizer.init("57e66aab");
        Synthesizer.init("57e66aab");
        DeviceEventEmitter.addListener("onRecognizerResult", this.onRecognizerResult);
        DeviceEventEmitter.addListener("onRecognizerVolumeChanged", this.onRecognizerVolumeChanged);
    }

    onSpeachResult(e) {

        if (e.from.lag == this.left.from && e.to.lag == this.left.to) {
            this.setState((previousState) => {
                return {
                    messages: GiftedChat.append(previousState.messages, {
                        _id: Math.round(Math.random() * 1000000),
                        text: e.from.text,
                        trans: e.to.text,
                        createdAt: new Date(),
                        user: {
                            _id: 2,
                            name: 'left',
                            avatar: FindFlags(e.from.lag),
                        },
                    }),
                };
            });
        }
        else if (e.from.lag == this.right.from && e.to.lag == this.right.to) {
            this.setState((previousState) => {
                return {
                    messages: GiftedChat.append(previousState.messages, {
                        _id: Math.round(Math.random() * 1000000),
                        text: e.from.text,
                        trans: e.to.text,
                        createdAt: new Date(),
                        user: {
                            _id: 1,
                            name: "right",
                            avatar: FindFlags(e.from.lag),
                        }
                    }),
                };
            });
        }

        AsyncStorage.setItem('trans_results', JSON.stringify(this.state.messages), (error)=>{
            console.log(error);
        });
    }

    componentWillUnmount() {
        this._isMounted = false;
        DeviceEventEmitter.removeListener("onRecognizerResult", this.onRecognizerResult);
        DeviceEventEmitter.addListener("onRecognizerVolumeChanged", this.onRecognizerVolumeChanged);
    }


    starRecognizer(current) {

        this.state.current = current;

        this.setRecognizerParam(current.from);
        Recognizer.start();
        this.refs.modal.open();
    }

    stopRecognizer() {
        Recognizer.stop();
    }

    async startSpeak(lag, text) {
        let isSpeaking = await Synthesizer.isSpeaking();

        this.setTtsParam(lag);

        isSpeaking ? Synthesizer.stop() : Synthesizer.start(text);
    }

    onRecognizerResult(e) {

        if (!e.isLast) {
            return;
        }

        let text = e.result;

        if(text == '' )
            return;

        let that = this;
        translate(text, {
            from: that.state.current.from,
            to: that.state.current.to,
            engine: 'google'
        }).then(function (result) {

            if(result[0].tts != '')
                that.playGoogleTts(result[0].tts);
            else
                that.startSpeak(result[0].to, result[0].text);

            let res = {
                from: {
                    lag: result[0].from,
                    text: text
                },
                to: {
                    lag: result[0].to,
                    text: result[0].text
                }
            };

            that.onSpeachResult(res);
        });
    }

    onRecognizerVolumeChanged(e) {

        let level = e.volume / 5;

        if(e.volume <= 5) level = 0;
        else if(e.volume > 5 && e.volume <=10) level = 1;
        else if(e.volume > 10 && e.volume <=15) level = 2;
        else if(e.volume > 15 && e.volume <=20) level = 3;
        else if(e.volume > 20 && e.volume <=25) level = 4;
        else if(e.volume > 25) level = 5;

        this.setState({level:level});
    }

    setRecognizerParam(lag) {
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

    setTtsParam(lag) {

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

    onLoadEarlier() {
        this.setState((previousState) => {
            return {
                isLoadingEarlier: true,
            };
        });

        AsyncStorage.getItem('trans_results', (error,result)=>{
            if (error){

            }else{
                try{
                    let messages = JSON.parse(result);

                    if (this._isMounted === true) {
                        this.setState((previousState) => {
                            return {
                                messages:  messages,
                                loadEarlier: false,
                                isLoadingEarlier: false,
                            };
                        });
                    }
                }catch (e) {
                    console.log(e);
                }

            }
        });
    }

    playGoogleTts(url) {

        Sound.setCategory('Playback', true);

        const callback = (error, sound) => {
            if (error) {
                alert(error.message);
                return;
            }
            else {
                sound.setVolume(1.0);
                sound.play((success) => {
                    if (success) {
                        console.log('successfully finished playing');
                    } else {
                        console.log('playback failed due to audio decoding errors', url);
                    }
                });
            }
        };

        const sound = new Sound(url, '', error => callback(error, sound));
    }

    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    left: {
                        backgroundColor: '#f0f0f0',
                    }
                }}
            />
        );
    }

    renderSystemMessage(props) {
        return (
            <SystemMessage
                {...props}
                containerStyle={{
                    marginBottom: 15,
                }}
                textStyle={{
                    fontSize: 14,
                }}
            />
        );
    }

    onInputIn(postion) {
        if (postion === 'left')
            this.starRecognizer(this.left);
        else
            this.starRecognizer(this.right);
    }

    onInputOut() {
        this.setState({typing:false});
        this.refs.modal.close();
        this.stopRecognizer();
    }

    renderInputToolbar() {
        return (
            <View style={styles.inputToolbar}>
                <View style={styles.wrapper}>
                    <Image source={FindFlags(this.left.from)} style={[styles.flag, {marginLeft: 3}]}/>
                    <TouchableOpacity style={styles.button}
                                      onPressIn={() => this.onInputIn('left')}
                                      onPressOut={this.onInputOut}
                    >
                        <Text style={[styles.buttonText, {textAlign: 'center'}]}>点击说话</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.micWrapper}>
                    <Icon name="ios-mic" size={30} color="#ccc"/>
                </View>
                <View style={styles.wrapper}>
                    <TouchableOpacity style={styles.button}
                                      onPressIn={() => this.onInputIn('right')}
                                      onPressOut={this.onInputOut}
                    >
                        <Text style={[styles.buttonText, {textAlign: 'center'}]}>Tap to input</Text>
                    </TouchableOpacity>
                    <Image source={FindFlags(this.right.from)} style={[styles.flag, {marginRight: 3}]}/>
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
            <GiftedChat
                messages={this.state.messages}
                loadEarlier={this.state.loadEarlier}
                isLoadingEarlier={this.state.isLoadingEarlier}
                user={{
                    _id: 1, // sent messages should have same user._id
                }}
                locale={'zh-cn'}
                timeFormat={'LT'}
                dateFormat={'ll'}
                showUserAvatar={true}
                renderLoadEarlier={() => <LoadEarlier label='加载历史记录' onLoadEarlier={this.onLoadEarlier}/>}
                renderBubble={this.renderBubble}
                renderSystemMessage={this.renderSystemMessage}
                renderInputToolbar={this.renderInputToolbar.bind(this)}
                // renderFooter={this.renderFooter.bind(this)}
            />
                <Modal style={styles.modal} position={"center"} ref={"modal"} backdrop={false} animationDuration={0}>
                    <VolumeView style={styles.container} level={this.state.level} />
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container:{
      flex:1
    },
    footerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
        marginLeft: 50,
        marginRight: 50,
        marginBottom:20,
    },
    buttonText: {
        fontSize: 16,
        color: '#555',
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputToolbar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        height: 44,
        borderRadius: 22,
        marginLeft: 15,
        marginRight: 15
    },
    wrapper: {
        justifyContent: 'center',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    micWrapper: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        width: 36,
        height: 36,
        borderRadius: 18,
        borderColor: '#ccc',
        borderWidth: 1
    },
    flag: {
        width: 36,
        height: 36,
        borderRadius: 18,
    },

    modal:{
        width: 160,
        height: 160,
        borderRadius: 5,
        backgroundColor: '#000000A0',
    }
});

export default TransView;