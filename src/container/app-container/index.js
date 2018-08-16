import React, { Component } from 'react';
import MobileDetect from 'mobile-detect';
import { WeChat, History, NativeModule, Statistics } from '../../service';
import { Loading, ErrorMessage } from '../../components';
import { Store, EventEmitter, Util } from '../../utils';
import { VALUE } from '../../constants';

export class AppContainer extends Component {
  state = {
    isEventBinded: false,
    loadCount: 0,
    error: ''
  };

  componentDidMount() {
    this.bindFetchEvent();
    this.initAPP();
    //this.initStatistics();
  }

  componentWillUnmount() {
    if (this.emitter) {
      this.emitter.removeAllListeners();
    }
  }

  bindFetchEvent() {
    EventEmitter.addListener('fetch-show-loading', () => {
      this.setState(prevState => ({
        loadCount: prevState.loadCount + 1
      }));
    });

    EventEmitter.addListener('fetch-hide-loading', () => {
      this.setState(prevState => ({
        loadCount: prevState.loadCount - 1
      }));
    });

    EventEmitter.addListener('fetch-error', error => {
      this.setState({
        error: error
      });
    });

    this.setState({
      isEventBinded: true
    });
  }

  initAPP = () => {
    if (!WeChat.isWeixinBrowser()) {

      const md = new MobileDetect(navigator.userAgent);
      if (md.os() === VALUE.IOS)
      {
        // 获取 token
        Util.setupWebViewJavascriptBridge( (bridge)=> {
          bridge.callHandler('getToken', {},(res)=> {
            const token = res;
            if(token){
              Store.localStorage.set('token',token);
            }
          })
        })

        // 获取 auth
        Util.setupWebViewJavascriptBridge( (bridge)=> {
          bridge.callHandler('getAuth', {},(res)=> {
            const auth = res.split('=')[1];
            if(auth){
              Store.localStorage.set('auth',auth);
            }
          })
        })
      }


      if (md.os() === VALUE.ANDORID_OS && window.HostApp)
      {
        const auth = window.HostApp.getAuth();
        const token = window.HostApp.getToken();
        NativeModule.disableAndroidPullToRefresh();
        if(token){
          Store.localStorage.set('token',token);
        }
        if(auth){
          Store.localStorage.set('auth',auth);
        }
      }

      /*if (Store.cookieStorage.get('auth')) {
        Store.localStorage.set('auth', Store.cookieStorage.get('auth'));
      }

      if (window.WinNativeBridge) {
        Store.localStorage.set('auth', window.WinNativeBridge.getAuth());
      }*/


    }
  };

  initStatistics = () => {
    Statistics.view();

    History.listen(() => {
      Statistics.view();
    });
  };

  onErrorMessageClickHandle = () => {
    this.setState({
      error: ''
    });
  };

  render() {
    return this.state.isEventBinded ? (
      <React.Fragment>
        {this.props.children}
        <Loading isLoading={this.state.loadCount !== 0} />
        <ErrorMessage isShow={!!this.state.error} text={this.state.error} onClick={this.onErrorMessageClickHandle} />
      </React.Fragment>
    ) : null;
  }
}

export default AppContainer;
