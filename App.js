import React, {Component} from 'react';
import {
    Easing,
    Animated,
    StatusBar,
    View
} from 'react-native';

//import CardStackStyleInterpolator from 'react-navigation/src/views/CardStackStyleInterpolator';

import {StackNavigator} from 'react-navigation';


import DailySentence from './src/DailySentence';
import TransView from './src/TransView';
import BingBackground from './src/BingBackground';

const Navigator = StackNavigator(
    {
        DailySentence: {screen: DailySentence},
        TransView: {screen: TransView},

    },
    {
        // transitionConfig: () => ({
        //     screenInterpolator: CardStackStyleInterpolator.forHorizontal,
        //         transitionSpec: {
        //         duration: 250,
        //             easing: Easing.bounce,
        //             timing: Animated.timing,
        //     },
        // }),
        navigationOptions: {
            header: null,
        },
        cardStyle: {
            backgroundColor: 'transparent'
        }
    }
);

class App extends Component {

    componentDidMount () {

    }

    render() {
        return (
            <BingBackground>
                <StatusBar
                    backgroundColor='#00000000'
                    translucent={true}
                />
                <Navigator style={{backgroundColor: 'red'}}/>
            </BingBackground>
        )
    }
}

export default App;