import React, {Component} from 'react';
import {
    View,
    StyleSheet
} from 'react-native';

import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons';

class VolumeView extends Component {
    constructor(props) {
        super(props);
    }

    onLayout(e) {

    }

    render() {

        let level = this.props.level;

        return (
            <View style={styles.container} onLayout={({nativeEvent: e}) => this.onLayout(e)}>
                <View style={styles.left}>
                    <Icon name="ios-mic" size={100} color={'#fff'}/>
                </View>
                <View style={styles.right}>
                    <View style={styles.volume}><View style={[styles.bar,{width:44, backgroundColor: (level >=5 ? '#fff':'transparent')}]} /></View>
                    <View style={styles.volume}><View style={[styles.bar,{width:38, backgroundColor: (level >=4 ? '#fff':'transparent')}]} /></View>
                    <View style={styles.volume}><View style={[styles.bar,{width:34, backgroundColor: (level >=3 ? '#fff':'transparent')}]} /></View>
                    <View style={styles.volume}><View style={[styles.bar,{width:28, backgroundColor: (level >=2 ? '#fff':'transparent')}]} /></View>
                    <View style={styles.volume}><View style={[styles.bar,{width:22, backgroundColor: (level >=1 ? '#fff':'transparent')}]} /></View>
                    <View style={styles.volume}><View style={[styles.bar,{width:16, backgroundColor: (level >=0 ? '#fff':'transparent')}]} /></View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        margin:15,
    },
    left:{
        flex:1,
        alignItems:'center',
    },
    right:{
        flex:1,
        height:85
    },
    volume:{
        flex:1,
        justifyContent:'flex-end'
    },
    bar:{
        width:48,
        height:6,
        backgroundColor:'#fff'
    }
});

VolumeView.propTypes = {
    level: PropTypes.number,
};

VolumeView.defaultProps = {
    level: 0
};



export default VolumeView;