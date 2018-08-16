import React from 'react';
import Style from './error-message.scss';

import Mask from '../mask';

const ErrorMessage = ({ text, isShow, onClick }) => (
  <Mask isShow={isShow} onClick={onClick}>
    <div className={Style.container}>
      <p className={Style.text}>{text}</p>
      <button className={Style.button} onClick={onClick}>
        关闭
      </button>
    </div>
  </Mask>
);

export default ErrorMessage;
