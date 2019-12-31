// @flow
import {Container, useTheme} from '@material-ui/core';
import {observer} from 'mobx-react-lite';
import useMediaQuery from '@material-ui/core/useMediaQuery/useMediaQuery';
import React, {useEffect} from 'react';
import {map, find} from 'lodash/fp';
import {Match} from 'react-router-dom';
import SectionHeader from 'v2/components/UI/SectionHeader';
import NodesStore from 'v2/stores/nodes';
import Button from 'v2/components/UI/Button';
import Mixpanel from 'v2/mixpanel';
import CopyBtn from 'v2/components/UI/CopyBtn';
import ValidatorName from 'v2/components/UI/ValidatorName';
import ValidatorsMap from 'v2/components/ValidatorsMap';
import InfoRow from 'v2/components/InfoRow';

import useStyles from './styles';
import Uptime from '../../UI/Uptime';

const ValidatorsDetail = ({match}: {match: Match}) => {
  const {validators, inactiveValidators} = NodesStore;

  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {params} = match;

  useEffect(() => {
    Mixpanel.track(`Clicked Validator ${params.id}`);
  }, [params.id]);

  let node =
    find({nodePubkey: params.id})(validators) ||
    find({nodePubkey: params.id})(inactiveValidators);

  if (!node) {
    return <div>Loading...</div>;
  }

  const {
    nodePubkey,
    calcCommission,
    identity = {},
    stakedSol,
    stakedSolPercent,
    uptimeStats,
  } = node;

  const {
    lastEpochUptimePercent,
    cumulativeUptimePercent,
    uptimeEpochs,
    uptimeComplete,
  } = uptimeStats || {};

  const specs = [
    {
      label: 'Address',
      hint: '',
      value: (
        <div className={classes.address}>
          <span className={classes.value}>{nodePubkey} </span>
          <CopyBtn text={nodePubkey} />
        </div>
      ),
    },
    {
      label: 'Staked SOL',
      hint: '',
      value: stakedSol ? `${stakedSol} (${stakedSolPercent}%)` : 'N/A',
    },
    {
      label: 'Website',
      hint: '',
      value: (
        <a target="_blank" rel="noopener noreferrer" href={identity.website}>
          {identity.website}
        </a>
      ),
    },
    {
      label: 'Uptime',
      hint: '',
      value: (
        <Uptime
          lastEpochUptimePercent={lastEpochUptimePercent}
          cumulativeUptimePercent={cumulativeUptimePercent}
          uptimeEpochs={uptimeEpochs}
          uptimeComplete={uptimeComplete}
        />
      ),
    },
    {
      label: 'keybase',
      hint: '',
      value: (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://keybase.io/${identity.keybaseUsername}`}
        >
          {identity.keybaseUsername}
        </a>
      ),
    },
    {
      label: 'Missed blocks',
      hint: '',
      value: 'TODO',
    },
    {
      label: 'details',
      hint: '',
      value: identity.details || '',
    },
    {
      label: 'commission',
      hint: '',
      value: `${calcCommission}%`,
    },
  ];

  const renderSpec = info => <InfoRow key={info.label} {...info} />;

  return (
    <Container>
      <SectionHeader title="Validator Detail">
        {!isMobile && (
          <div className={classes.validatorName}>
            <ValidatorName
              pubkey={nodePubkey}
              name={identity.name}
              avatar={identity.avatarUrl}
            />
          </div>
        )}
        {!identity.keybaseUsername && (
          <div className={classes.headerBtn}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              color="primary"
              href="https://github.com/solana-labs/tour-de-sol#publishing-information-about-your-validator"
              target="_blank"
              rel="noopener noreferrer"
            >
              Connect To Keybase
            </Button>
          </div>
        )}
      </SectionHeader>
      <div className={classes.body}>
        <ul className={classes.spec}>
          {isMobile && (
            <li>
              <div className={classes.label}>Name</div>
              <div className={classes.value}>
                <div className={classes.validatorName}>
                  <span />
                  {nodePubkey}
                </div>
              </div>
            </li>
          )}
          {map(renderSpec)(specs)}
        </ul>
        <div className={classes.map}>
          <ValidatorsMap markers={[node]} />
        </div>
      </div>
    </Container>
  );
};

export default observer(ValidatorsDetail);
