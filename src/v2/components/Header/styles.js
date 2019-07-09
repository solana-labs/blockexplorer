import {makeStyles} from '@material-ui/core';
import {fade} from '@material-ui/core/styles';
import getColor from 'v2/utils/getColor';

export default makeStyles(theme => ({
  root: {
    padding: '18px 28px',
    borderBottom: `1px solid ${fade(theme.palette.primary.grey3, 0.5)}`,
    zIndex: theme.zIndex.drawer + 1,
    [theme.breakpoints.down('sm')]: {
      padding: '18px 0',
    },
  },
  inner: {
    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
    },
  },
  search: {
    marginLeft: 25,
    marginRight: 'auto',
    width: '100%',
    maxWidth: 713,
    [theme.breakpoints.down('sm')]: {
      order: 1,
      marginLeft: 0,
      maxWidth: '100%',
    },
  },
  realTime: {
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    marginLeft: 25,
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 2.5,
    marginRight: 25,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
    '& div': {
      background: 'transparent',
      border: `1px solid ${getColor('main')(theme)}`,
      color: getColor('main')(theme),
      textTransform: 'uppercase',
      display: 'flex',
      alignItems: 'center',
      padding: '0 15px',
      height: 40,
      marginLeft: 15,
      '& svg': {
        marginLeft: 20,
      },
    },
  },
  networkSelect: {
    minWidth: 125,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  menuButton: {
    display: 'none',
    marginLeft: 'auto',
    [theme.breakpoints.down('sm')]: {
      display: 'block',
    },
  },
}));
