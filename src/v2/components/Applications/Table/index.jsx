// @flow

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import cn from 'classnames';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {useTheme} from '@material-ui/core/styles';
import {observer} from 'mobx-react-lite';
import {Link} from 'react-router-dom';
import {map} from 'lodash/fp';
import HelpLink from 'v2/components/HelpLink';
import TypeLabel from 'v2/components/UI/TypeLabel';
import type {TableHeadProps} from 'v2/@types/table';

import useStyles from './styles';

const tHeads: TableHeadProps[] = [
  {
    name: 'Application Id',
    text: '',
    term: '',
  },
  {
    name: 'type',
    text: '',
    term: '',
  },
  {
    name: 'balance',
    text: '',
    term: '',
  },
];

const ApplicationsTable = ({separate}: {separate: boolean}) => {
  const classes = useStyles();
  const theme = useTheme();
  const showTable = useMediaQuery(theme.breakpoints.up('md'));
  const blocks = [];

  const renderRow = application => {
    return (
      <TableRow hover key={application.id}>
        <TableCell align="center">
          <Link to={`/applications/${application.id}`} className={classes.name}>
            7887319
          </Link>
        </TableCell>
        <TableCell>
          <TypeLabel type="other" label="other" />
        </TableCell>
        <TableCell>0.006 SOL | $1.12</TableCell>
      </TableRow>
    );
  };
  const renderTH = ({name, width, ...rest}: TableHeadProps) => (
    <TableCell key={name} width={width}>
      {name}
      <HelpLink {...rest} />
    </TableCell>
  );

  return (
    <div className={classes.root}>
      {showTable ? (
        <Table>
          <TableHead className={classes.head}>
            <TableRow>{map(renderTH)(tHeads)}</TableRow>
          </TableHead>
          <TableBody
            classes={{
              root: classes.body,
            }}
          >
            {map(renderRow)(blocks)}
            <TableRow hover>
              <TableCell align="center">
                <Link to={`/applications/1234`} className={classes.name}>
                  7887319
                </Link>
              </TableCell>
              <TableCell>
                <TypeLabel type="other" label="other" />
              </TableCell>
              <TableCell>0.006 SOL | $1.12</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      ) : (
        <div className={cn(classes.list, separate && classes.vertical)}>
          <div className={classes.card}>
            <ul>
              <li>
                <div className={classes.cardTitle}>Application id</div>
                <div>7887219</div>
              </li>
              <li>
                <div className={classes.cardTitle}>Type</div>
                <div>
                  <TypeLabel type="other" label="other" />
                </div>
              </li>
              <li>
                <div className={classes.cardTitle}>Balance</div>
                <div>0.006 SOL | $1.12</div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(ApplicationsTable);
