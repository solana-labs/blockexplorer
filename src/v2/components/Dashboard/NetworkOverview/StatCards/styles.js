import {makeStyles} from '@material-ui/core';
import getColor from 'v2/utils/getColor';

export default makeStyles(theme => ({
  card: {
    height: 164,
    '& svg': {
      width: '100%',
      height: 150,
      marginTop: -2,
    },
  },
  val: {
    fontSize: 60,
    fontWeight: 'bold',
    color: getColor('main')(theme),
    margin: '20px 0',
  },
  leader: {
    textDecoration: 'none',
    '& h2': {
      fontSize: 20,
      fontWeight: 'bold',
      color: getColor('main')(theme),
      marginTop: 40,
      letterSpacing: 3.4,
    },
  },
  changes: {
    fontSize: 18,
    fontWeight: 'bold',
  },
}));
