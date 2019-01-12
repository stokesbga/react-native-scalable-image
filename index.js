import React from "react";
import PropTypes from "prop-types";
import { Image } from "react-native";
import _ from "lodash";
import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
import FastImage from "@outfix/react-native-fast-image";

export default class ScalableImage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      size: {
        width: 0,
        height: 0
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
    if (!_.isEqual(nextProps.source, this.props.source) || this.props.enableFastProps)
      this.onProps(nextProps);
  }

  onProps(props) {
    if (props.source.uri) {
      const source = props.source.uri;
      Image.getSize(source, (width, height) => this.adjustSize(width, height, props), console.log);
    } else {
      const source = resolveAssetSource(props.source);
      this.adjustSize(source.width, source.height, props);
    }
  }

  adjustSize(sourceWidth, sourceHeight, props) {
    const { width, height } = props;

    let ratio = 1;

    if (width && height) {
      ratio = Math.min(width / sourceWidth, height / sourceHeight);
    } else if (width) {
      ratio = width / sourceWidth;
    } else if (height) {
      ratio = height / sourceHeight;
    }

    if (this.mounted) {
      this.setState(
        {
          size: {
            width: sourceWidth * ratio,
            height: sourceHeight * ratio
          }
        },
        () => this.props.onSize(this.state.size)
      );
    }
  }

  render() {
    return <FastImage {...this.props} style={[this.props.style, this.state.size]} />;
  }
}

ScalableImage.propTypes = {
  onSize: PropTypes.func,
  enableFastProps: PropTypes.bool
};

ScalableImage.defaultProps = {
  onSize: size => {},
  enableFastProps: false
};
