// @flow
import React from 'react';
import MapTooltip from 'v2/components/UI/MapTooltip';
import Avatar from 'v2/components/UI/Avatar';
import ValidatorName from 'v2/components//UI/ValidatorName';

import useStyles from './styles';

const Marker = ({scale, marker}: {scale: number, marker: any}) => {
  const classes = useStyles();
  const transformScale = scale < 4 ? scale / 4 : 1;
  const {
    nodePubkey,
    identity = {},
    calcCommission,
    calcUptime,
    stakedSol,
    stakedSolPercent,
  } = marker;

  return (
    <MapTooltip
      classes={{tooltip: classes.tooltip}}
      title={() => (
        <div className={classes.inner}>
          <ValidatorName
            pubkey={nodePubkey}
            name={identity.name}
            avatar={identity.avatarUrl}
          />
          <div className={classes.info}>
            <div>
              Total Sol:{' '}
              {stakedSol ? `${stakedSol} (${stakedSolPercent}%)` : 'N/A'}
            </div>
            <div>
              Commission: {calcCommission ? `${calcCommission}%` : 'N/A'}
            </div>
            <div>Uptime: {calcUptime ? `${calcUptime}%` : 'Unavailable'}</div>
          </div>
        </div>
      )}
    >
      <div
        className={classes.marker}
        style={{transform: `scale(${transformScale})`}}
      >
        <Avatar
          width={40}
          height={40}
          avatarUrl={identity.avatarUrl}
          name={identity.name}
          pubkey={nodePubkey}
        />
      </div>
    </MapTooltip>
  );
};

export default Marker;
