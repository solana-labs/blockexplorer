import {makeStyles} from '@material-ui/core';
import {fade} from '@material-ui/core/styles';
import getColor from 'v2/utils/getColor';

export default makeStyles(theme => ({
  outline: {
    border: '1px solid transparent',
    display: 'inline-block',
    padding: 7,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    borderColor: getColor('main')(theme),
    '& button': {
      borderRadius: 0,
      '&:hover': {
        backgroundColor: fade(getColor('main')(theme), 0.8),
      },
    },
    '& a': {
      borderRadius: 0,
      '&:hover': {
        backgroundColor: fade(getColor('main')(theme), 0.8),
      },
    },
  },
}));
