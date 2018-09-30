import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import FastImage from 'react-native-fast-image';

export default class ScalableImage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            size: {
                width: props.invisibleUntilLoad ? 0 : props.width,
                height: props.invisibleUntilLoad ? 0 : props.height,
            }
        };

        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
        this.onProps(this.props);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        this.onProps(nextProps);
    }

    onProps(props) {
        if (props.source.uri) {
            const source = props.source.uri;
            Image.getSize(source, (width, height) => this.adjustSize(width, height, props));
        }
        else {
            const source = resolveAssetSource(props.source);
            this.adjustSize(source.width, source.height, props);
        }
    }

    adjustSize(sourceWidth, sourceHeight, props) {
        const { width, height, maxWidth, maxHeight } = props;

        let ratio = 1;

        if (width && height) {
            ratio = Math.min(width / sourceWidth, height / sourceHeight);
        }
        else if (width) {
            ratio = width / sourceWidth;
        }
        else if (height) {
            ratio = height / sourceHeight;
        }

        if (this.mounted) {
            this.setState({
                size: {
                    width: sourceWidth * ratio,
                    height: sourceHeight * ratio
                }
            }, () => this.props.onSize(this.state.size));
        }
    }

    render() {
        return <FastImage { ...this.props } style={[this.props.style, this.state.size]}/>;
    }
}

ScalableImage.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    onSize: PropTypes.func,
    invisibleUntilLoad: PropTypes.bool,
};

ScalableImage.defaultProps = {
    onSize: size => {},
    width: 100,
    height: 100,
    invisibleUntilLoad: false,
};
