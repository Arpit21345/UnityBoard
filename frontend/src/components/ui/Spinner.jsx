import React from 'react';
export default function Spinner({ size=20 }){
  return <span className="ub-spinner" style={{width:size,height:size}} aria-label="Loading" />;
}
