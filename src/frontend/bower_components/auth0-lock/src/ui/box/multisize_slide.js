/*!
governify-gateway 1.0.0, built on: 2018-03-27
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-gateway

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import CSSCore from 'fbjs/lib/CSSCore';

export default class Slider extends React.Component {
  constructor(props) {
    super(props);
    this.state = { children: { current: props.children } };
  }

  componentWillReceiveProps(nextProps) {
    // TODO: take a prop to identify what are we rendering instead of
    // infering it from children keys so we can accept more than one
    // child (we are already wrapping them).
    if (this.state.children.current.key != nextProps.children.key) {
      this.setState({
        children: {
          current: nextProps.children,
          prev: this.state.children.current
        },
        transitionName: this.props.transitionName
      });
      this.animate = true;
    } else if (!this.timeout) {
      this.setState({
        children: { current: nextProps.children },
        transitionName: nextProps.transitionName
      });
    }
  }

  componentDidUpdate() {
    if (this.animate) {
      this.animate = false;

      const { transitionName } = this.state;
      const { current, prev } = this.state.children;
      const { reverse } = this.props;
      const currentComponent = this.refs[current.key];
      const prevComponent = this.refs[prev.key];

      const transition = (component, className, delay) => {
        // eslint-disable-next-line
        const node = ReactDOM.findDOMNode(component);
        const activeClassName = `${className}-active`;

        CSSCore.addClass(node, className);

        setTimeout(() => CSSCore.addClass(node, activeClassName), 17);

        if (delay) {
          setTimeout(() => {
            CSSCore.removeClass(node, className);
            CSSCore.removeClass(node, activeClassName);
          }, delay);
        }
      };

      const callback = slide => {
        currentComponent.componentWillSlideIn(slide);
        const classNamePrefix = reverse ? 'reverse-' : '';
        transition(currentComponent, `${classNamePrefix}${transitionName}-enter`, this.props.delay);
        transition(prevComponent, `${classNamePrefix}${transitionName}-exit`);

        this.timeout = setTimeout(() => {
          this.setState({
            children: { current: this.state.children.current },
            transitionName: this.props.transitionName
          });
          currentComponent.componentDidSlideIn(::this.props.onDidAppear);
          this.props.onDidSlide();
          this.timeout = null;
        }, this.props.delay);
      };

      this.props.onWillSlide();
      prevComponent.componentWillSlideOut(callback);
    }
  }

  componentWillUnmount() {
    if (this.timeout) clearTimeout(this.timeout);
  }

  render() {
    const { current, prev } = this.state.children;
    const children = prev ? [current, prev] : [current];
    const childrenToRender = children.map(child => {
      return React.cloneElement(React.createElement(Child, {}, child), {
        ref: child.key,
        key: child.key
      });
    });

    return React.createElement(this.props.component, {}, childrenToRender);
  }
}

Slider.propTypes = {
  children: PropTypes.node.isRequired,
  component: PropTypes.string,
  delay: PropTypes.number.isRequired,
  onDidAppear: PropTypes.func.isRequired,
  onDidSlide: PropTypes.func.isRequired,
  onWillSlide: PropTypes.func.isRequired,
  reverse: PropTypes.bool.isRequired,
  transitionName: PropTypes.string.isRequired
};

Slider.defaultProps = {
  component: 'span',
  onDidAppear: () => {},
  onDidSlide: () => {},
  onWillSlide: () => {},
  reverse: false
};

class Child extends React.Component {
  constructor(props) {
    super(props);
    this.state = { height: '', originalHeight: '', show: true };
  }

  node;

  componentWillSlideIn(slide) {
    this.setState({
      height: slide.height,
      originalHeight: parseInt(window.getComputedStyle(this.node, null).height, 10),
      show: false
    });
  }

  componentDidSlideIn(cb) {
    const { height, originalHeight } = this.state;

    if (height === originalHeight) {
      this.setState({ show: true, height: '' });
      cb();
    } else {
      this.cb = cb;
      const frames = 10;
      let count = 0;
      let current = height;
      const last = originalHeight;
      const step = Math.abs(current - last) / frames;
      const dir = current < last ? 1 : -1;
      const dh = step * dir;

      // TODO: rAF
      this.t = setInterval(() => {
        if (count < frames - 1) {
          this.setState({ height: current, animating: true });
          current += dh;
          count++;
        } else {
          clearInterval(this.t);
          delete this.t;
          this.setState({ height: '', show: true });
          this.cb();
        }
      }, 17);
    }
  }

  componentWillSlideOut(cb) {
    const size = window.getComputedStyle(this.node, null).height;
    cb({ height: parseInt(size, 10), reverse: this.reverse });
  }

  componentWillUnmount() {
    if (this.t) {
      clearInterval(this.t);
      cb();
    }
  }

  render() {
    const { children } = this.props;
    const { height, show } = this.state;

    return (
      <div ref={node => (this.node = node)} style={height ? { height: height + 'px' } : {}}>
        <div style={{ visibility: show ? 'inherit' : 'hidden' }}>{children}</div>
      </div>
    );
  }
}

Child.propTypes = {
  children: PropTypes.node.isRequired
};
