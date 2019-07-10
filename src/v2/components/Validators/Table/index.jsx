// @flow

import React from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Grid,
} from '@material-ui/core';
import cn from 'classnames';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import {observer} from 'mobx-react-lite';
import {Link} from 'react-router-dom';
import {map} from 'lodash/fp';
import NodesStore from 'v2/stores/nodes';

import useStyles from './styles';

const ValidatorsTable = ({separate}: {separate: boolean}) => {
  const classes = useStyles();
  const theme = useTheme();
  const showTable = useMediaQuery(theme.breakpoints.up('md'));
  const {
    cluster: {voting = []},
  } = NodesStore;
  const renderRow = row => {
    return (
      <TableRow hover key={row.nodePubkey}>
        <TableCell align="center">
          <Link to={`validators/${row.nodePubkey}`} className={classes.name}>
            <span />
            <div>{row.nodePubkey}</div>
          </Link>
        </TableCell>
        <TableCell>{row.stake} Lamports</TableCell>
        <TableCell>{row.commission}</TableCell>
      </TableRow>
    );
  };
  const renderCard = card => {
    return (
      <div
        className={cn(classes.card, separate && classes.cardVertical)}
        key={card.nodePubkey}
      >
        <Link to={`validators/${card.nodePubkey}`} className={classes.name}>
          <span />
          <div>{card.nodePubkey}</div>
        </Link>
        <Grid container>
          <Grid item xs={4} zeroMinWidth>
            <div className={classes.cardTitle}>Stake</div>
            <div>{card.stake} Lamports</div>
          </Grid>
          <Grid item xs={4} zeroMinWidth>
            <div className={classes.cardTitle}>Commission</div>
            <div>{card.commission}</div>
          </Grid>
        </Grid>
      </div>
    );
  };
  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography>Validators</Typography>
        <Typography variant="h5">{voting.length}</Typography>
        {!separate && (
          <Link to="validators/all" className={classes.link}>
            See all &gt;
          </Link>
        )}
      </div>
      {showTable ? (
        <Table>
          <TableHead className={classes.head}>
            <TableRow>
              <TableCell align="center">Name/Moniker</TableCell>
              <TableCell>Stake</TableCell>
              <TableCell>Commission</TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            classes={{
              root: classes.body,
            }}
          >
            {map(renderRow)(voting)}
          </TableBody>
        </Table>
      ) : (
        <div className={cn(classes.list, separate && classes.vertical)}>
          {map(renderCard)(voting)}
        </div>
      )}
    </div>
  );
};

export default observer(ValidatorsTable);
