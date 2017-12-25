import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    AsyncStorage
} from "react-native";

class DailySentence extends Component {

    constructor(props) {
        super(props);

        this.state = {
            content: '',
            note: ''
        };
        this.timer = null;
    }

    componentWillMount() {
        this.getDailySentence();

        let that = this;
        this.timer = setTimeout(() => {
            that.timer = null;
            that.goNext();
        }, 8000);
    }

    getDailySentence() {
        let that = this;
        AsyncStorage.getItem("jinsan", function (errs, result) {
            if (!errs) {
                let res = JSON.parse(result);
                that.setState({content: res.content, note: res.note});
            }
        });

        fetch('http://open.iciba.com/dsapi/')
            .then(function (response) {
                console.log(response);
                try {
                    let res = JSON.parse(response._bodyText);
                    that.setState({content: res.content, note: res.note});

                    AsyncStorage.setItem("jinsan", response._bodyText, function (errs) {
                        if (errs) {
                            console.log('存储错误');
                        }
                    });

                } catch (e) {

                }
            });
    }

    goNext() {
        if(this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this.props.navigation.navigate('TransView', {name: 'Lucy'});
    }

    render() {
        return (
            <TouchableWithoutFeedback style={styles.container} onPress={()=>this.goNext()}>
                <View style={styles.container}>
                    <Text style={styles.note}>{this.state.note}</Text>
                    <View style={{flex: 1}}/>
                    <Text style={styles.content}>{this.state.content}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#00000000',
        flex: 1,
    },
    note: {
        fontSize: 25,
        color: '#fff',
        marginTop: 40,
        marginLeft: 10,
        marginRight: 40,
        fontStyle: 'italic'
    },
    content: {
        fontSize: 20,
        color: '#FFFFFFBF',
        marginBottom: 20,
        marginLeft: 40,
        marginRight: 10,
        textAlign: 'right',
        fontStyle: 'italic',
        textDecorationLine: 'underline'
    },
});

export default DailySentence;