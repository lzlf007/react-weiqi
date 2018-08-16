import React from 'react';
import Style from './style.scss';

const Loading = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className={Style.container}>
      <div>
        <div className={Style.spinner} />
      </div>
    </div>
  );
};

export default Loading;
