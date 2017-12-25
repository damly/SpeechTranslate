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


class ArtView extends Component {
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

        let middle = this.height / 2;

        let space = this.width / this.props.count;

        let path = Path().moveTo(0, middle);

        let flag = 1;
        let x = 0;
        let w = this.height;
        for (let i = 0; i < this.props.count; i++) {
            let v = 1 - Math.abs(Math.cos((2 * Math.PI / 360) * ((i * 180) / (this.props.count - 1))));
            let height = Math.random() * w * v / 2;
            flag = flag == 1 ? -1 : 1;

            let y = middle + height * flag * this.props.volume / (this.props.max - this.props.min);
            x = x + space;

            path.lineTo(x, y);
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

ArtView.propTypes = {
    count: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    volume: PropTypes.number,
    lineWidth: PropTypes.number,
    lineColor: PropTypes.string,
};

ArtView.defaultProps = {
    count: 500,
    lineColor: '#000',
    lineWidth: 1,
    min: 0,
    max: 10,
    volume: 0
};

export default ArtView;