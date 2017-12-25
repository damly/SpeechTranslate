import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    AsyncStorage,
    Dimensions,
    Image
} from "react-native";

import RNFS from 'react-native-fs';
import SplashScreen from 'react-native-splash-screen';

const {width, height} = Dimensions.get('window');

var host = 'http://cn.bing.com/';

var path =  RNFS.DocumentDirectoryPath + '/launch_screen.jpg';
var local = 'file://' + path;

class BingBackground extends Component {

    constructor(props) {
        super(props);

        this.state = {
            url: ''
        };
    }

    componentWillMount() {
        this.checkDownloaded();
    }

    checkDownloaded() {
        let that = this;

        console.log(local);

        RNFS.stat(local).then((stat)=>{

            let ctime = new Date(stat.ctime);
            let cur = new Date();

            if(cur.getFullYear() != ctime.getFullYear()  || cur.getMonth() != ctime.getMonth() || cur.getDate() != ctime.getDate()) {
                that.getBackground();
            }
            else {
                that.setState({url: local});
            }
        }).catch(err => {
            console.log('err stat', err);
            that.getBackground();
        });
    }

    saveBackground(url) {

        let that = this;

        const options = {
            fromUrl: url,
            toFile: path,
            background: true,
        };
        try {
            const ret = RNFS.downloadFile(options);
            ret.promise.then(res => {
                console.log('success', res);
                that.setState({url: local});
            }).catch(err => {
                console.log('err', err);
            });
        }
        catch (e) {
            console.log(error);
        }
    }

    getBackground() {
        let that = this;

        fetch(host + 'HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN')
            .then(function (response) {
                console.log(response);
                try {
                    let res = JSON.parse(response._bodyText);
                    //that.setState({url: host + res.images[0].url});
                    console.log(res);
                    that.saveBackground(host + res.images[0].url);
                } catch (e) {
                }
            });
    }

    render() {

        let source = require('./images/bg.jpg');

        if(this.state.url !== '') {
            source = {uri:this.state.url};
        }

        return (
            <Image source={source} style={styles.container}
                   onLoadEnd={()=>{SplashScreen.hide();}}
            >
                {this.props.children}
            </Image>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: width,
        height: height,
    },
});

export default BingBackground;