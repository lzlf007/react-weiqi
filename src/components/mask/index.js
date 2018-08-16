import React, { Component } from 'react';
import Style from './style.scss';

class Mask extends Component {
  render() {
    if (!this.props.isShow) {
      return null;
    }

    return (
      <div className={`${Style.container} ${this.props.className}`} onClick={this.props.onClick}>
        {this.props.children}
      </div>
    );
  }
}

export default Mask;
