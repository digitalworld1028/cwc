import React from 'react';
import moment from 'moment';

function ConvertDateToLocal ({utcDate}) {
  let toLocalDate = ' - ';
  if (utcDate !== null && utcDate !== '' && !isNaN(moment(utcDate, 'YYYY:MM:DD:hh:mm:ss')) && moment(utcDate, 'YYYY:MM:DD:hh:mm:ss').isValid()) {
     toLocalDate = moment.utc(utcDate, 'YYYY:MM:DD:hh:mm:ss').local().format('MM/DD/YYYY hh:mm:ss A');
  } else {
    toLocalDate = '-'
  }
  
  return (
    <span>{toLocalDate}</span>
  );
}

export default ConvertDateToLocal;
