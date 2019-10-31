// @flow

import React from 'react';
import {Typography, TableCell, TableRow, Grid} from '@material-ui/core';
import cn from 'classnames';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import {observer} from 'mobx-react-lite';
import {Link} from 'react-router-dom';
import {map} from 'lodash/fp';
import Table from 'v2/components/UI/Table';
import HelpLink from 'v2/components/HelpLink';
import ValidatorName from 'v2/components/UI/ValidatorName';

import useStyles from './styles';
import Uptime from '../../UI/Uptime';

const fields = [
  {
    label: 'rank',
    id: 'rank',
    text: '',
    term: '',
  },
  {
    label: 'name',
    id: 'name',
    text: '',
    term: '',
  },
  {
    label: 'Staked sol',
    id: 'activatedStake',
    text: '',
    term: '',
  },
  {
    label: 'Slot',
    id: 'slot',
    text: '',
    term: '',
  },
  {
    label: 'Uptime',
    id: 'uptimePercent',
    text: '',
    term: '',
  },
];

const ValidatorsTable = ({
  activeValidators,
  separate,
}: {
  activeValidators: Array,
  separate: boolean,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const showTable = useMediaQuery(theme.breakpoints.up('md'));

  const renderRow = ({data: row}) => {
    const {
      name,
      pubkey,
      avatarUrl,
      activatedStake,
      activatedStakePercent,
      slot,
      lastEpochUptimePercent,
      cumulativeUptimePercent,
      uptimeEpochs,
      uptimeComplete,
      rank,
    } = row;

    return (
      <TableRow hover key={pubkey}>
        <TableCell width={20}>{rank}</TableCell>
        <TableCell width={300}>
          <ValidatorName pubkey={pubkey} name={name} avatar={avatarUrl} />
        </TableCell>
        <TableCell width={200}>
          {activatedStake.toFixed(8) || 'N/A'} (
          {activatedStakePercent.toFixed(3)}%)
        </TableCell>
        <TableCell width={80}>{slot}</TableCell>
        <TableCell width={120}>
          <Uptime
            lastEpochUptimePercent={lastEpochUptimePercent}
            cumulativeUptimePercent={cumulativeUptimePercent}
            uptimeEpochs={uptimeEpochs}
            uptimeComplete={uptimeComplete}
          />
        </TableCell>
      </TableRow>
    );
  };
  const renderCard = card => {
    const {
      name,
      pubkey,
      avatarUrl,
      activatedStake,
      activatedStakePercent,
      lastEpochUptimePercent,
      cumulativeUptimePercent,
      uptimeEpochs,
      uptimeComplete,
    } = card;

    return (
      <div
        className={cn(classes.card, separate && classes.cardVertical)}
        key={pubkey}
      >
        <ValidatorName pubkey={pubkey} name={name} avatar={avatarUrl} />
        <Grid container>
          <Grid item xs={6} zeroMinWidth>
            <div className={classes.cardTitle}>Stake</div>
            <div>
              {activatedStake.toFixed(4) || 'N/A'} (
              {activatedStakePercent.toFixed(3)}%)
            </div>
          </Grid>
          <Grid item xs={6} zeroMinWidth>
            <div className={classes.cardTitle}>Uptime</div>
            <Uptime
              lastEpochUptimePercent={lastEpochUptimePercent}
              cumulativeUptimePercent={cumulativeUptimePercent}
              uptimeEpochs={uptimeEpochs}
              uptimeComplete={uptimeComplete}
            />
          </Grid>
        </Grid>
      </div>
    );
  };

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Typography>
          Active Validators
          <HelpLink
            text="The number of validators currently confirming the legitimacy of entries added to the ledger."
            term=""
          />
        </Typography>
        <Typography variant="h5">{activeValidators.length}</Typography>
        {!separate && (
          <Link to="/validators/all" className={classes.link}>
            See all &gt;
          </Link>
        )}
      </div>
      {showTable ? (
        <Table fields={fields} renderRow={renderRow} data={activeValidators} />
      ) : (
        <div className={cn(classes.list, separate && classes.vertical)}>
          {map(renderCard)(activeValidators)}
        </div>
      )}
    </div>
  );
};

export default observer(ValidatorsTable);
