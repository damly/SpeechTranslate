import React, {Component} from 'react';
import {
    ART,
    View
} from 'react-native';

import PropTypes from 'prop-types';

const {
    Surface,
    Shape,
    Path,
} = ART;


class WaveForm extends Component {
    constructor(props) {
        super(props);

        this.width = 0;
        this.height = 0;
    }

    onLayout(e) {
        console.log(e);
        this.width = e.layout.width;
        this.height = e.layout.height;
    }

    render() {

        if(this.props.volume == 0) {
            return (
                <View style={this.props.style} onLayout={({nativeEvent: e}) => this.onLayout(e)} />
            )
        }

        let middle = this.height / 2;
        let space = this.props.lineWidth * 3;
        let count = this.width / space;

        const path = Path();

        let x = 0;
        let w = this.height;
        for (let i = 0; i < count; i++) {
            let v = 1 - Math.abs(Math.cos((2 * Math.PI / 360) * ((i * 180) / (count - 1))));
            let height = (Math.random() * w * v / 2) * this.props.volume / (this.props.max - this.props.min);

            let y = middle - height / 2;
            x = x + space;

            path.moveTo(x, y);
            path.lineTo(x, y + height);
        }

        return (
            <View style={this.props.style} onLayout={({nativeEvent: e}) => this.onLayout(e)}>
                <Surface width={this.width} height={this.height}>
                    <Shape stroke={this.props.lineColor} strokeWidth={this.props.lineWidth} d={path}/>
                </Surface>
            </View>
        );
    }
}

WaveForm.propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    volume: PropTypes.number,
    lineWidth: PropTypes.number,
    lineColor: PropTypes.string,
};

WaveForm.defaultProps = {
    lineColor: '#000',
    lineWidth: 1,
    min: 0,
    max: 10,
    volume: 0
};

export default WaveForm;