import {filter, reduce, orderBy} from 'lodash/fp';

import {LAMPORT_SOL_RATIO} from '../../util';

const slotsPerDay = (1.0 * 24 * 60 * 60) / 0.8;
const TDS_DEFAULT_STAGE_LENGTH_BLOCKS = slotsPerDay * 5.0;

const stages = [
  {id: 0, title: 'Stage 0', hidden: true},
  {
    id: 1,
    title: 'Stage 1',
    isTbd: true,
    startDate: '2019-09-09T17:00:00.0Z',
    endDate: '2019-09-13T17:00:00.0Z',
    duration: TDS_DEFAULT_STAGE_LENGTH_BLOCKS,
  },
  {
    id: 2,
    title: 'Stage 2',
    isTbd: true,
    startDate: '2019-10-07T17:00:00.0Z',
    endDate: '2019-10-11T17:00:00.0Z',
    duration: TDS_DEFAULT_STAGE_LENGTH_BLOCKS,
  },
  {
    id: 3,
    title: 'Stage 3',
    isTbd: true,
    startDate: '2019-11-04T17:00:00.0Z',
    endDate: '2019-11-08T17:00:00.0Z',
    duration: TDS_DEFAULT_STAGE_LENGTH_BLOCKS,
  },
];

/**
 * TourDeSolIndexView : supports the Tour de Sol index page
 *
 * Changes:
 *   - 20190912.01 : initial version
 */
const __VERSION__ = 'TourDeSolIndexView@1.0.0';
export class TourDeSolIndexView {
  asVersion(rawData, __errors__, version) {
    if (__errors__) {
      return {
        __VERSION__,
        __errors__,
      };
    }

    const {isDemo, activeStage, clusterInfo, lastSlot} = rawData;

    const activeValidatorsRaw = filter(
      node => node.what === 'Validator' && node.activatedStake,
    )(clusterInfo.network);
    const inactiveValidatorsRaw = filter(
      node => node.what === 'Validator' && !node.activatedStake,
    )(clusterInfo.network);

    const currentStage = activeStage ? stages[activeStage] : null;
    const slotsLeftInStage =
      currentStage && currentStage.duration && currentStage.duration - lastSlot;
    const daysLeftInStage =
      slotsLeftInStage && (slotsLeftInStage / slotsPerDay).toFixed(3);

    const clusterStats = {
      lastSlot,
      slotsLeftInStage,
      daysLeftInStage,
      stageDurationBlocks: currentStage && currentStage.duration,
      networkInflationRate: clusterInfo.networkInflationRate,
      totalSupply: clusterInfo.supply * LAMPORT_SOL_RATIO,
      totalStaked: clusterInfo.totalStaked * LAMPORT_SOL_RATIO,
      activeValidators: activeValidatorsRaw.length,
      inactiveValidators: inactiveValidatorsRaw.length,
    };

    const scoreParams = this.computeScoreParams(
      activeValidatorsRaw,
      isDemo,
      lastSlot,
      currentStage,
    );

    const activeValidatorsPre = reduce((a, x) => {
      const pubkey = x.nodePubkey;
      const slot = x.currentSlot;
      const {name, avatarUrl} = x.identity;
      const activatedStake = x.activatedStake * LAMPORT_SOL_RATIO;
      const uptimePercent =
        x.uptime &&
        x.uptime.uptime &&
        x.uptime.uptime.length &&
        100.0 * parseFloat(x.uptime.uptime[0].percentage);
      const score = this.computeNodeScore(x, scoreParams);

      const validator = {
        name,
        pubkey,
        avatarUrl,
        activatedStake,
        slot,
        uptimePercent,
        score,
      };

      a.push(validator);

      return a;
    })([], activeValidatorsRaw);

    const activeValidatorsRank = orderBy('score', 'desc')(activeValidatorsPre);

    const result = reduce((a, x) => {
      const {lastScore, lastRank, accum} = a;
      const {score} = x;
      const rank = score < lastScore ? lastRank + 1 : lastRank;

      x.rank = rank;

      accum.push(x);

      return {lastScore: score, lastRank: rank, accum};
    })({lastScore: 101, lastRank: 0, accum: []}, activeValidatorsRank);

    if (version === 'TourDeSolIndexView@latest' || version === __VERSION__) {
      return {
        __VERSION__,
        rawData,
        clusterStats,
        activeValidators: result.accum,
        stages,
        activeStage,
        slotsPerDay,
      };
    }

    return {
      error: 'UnsupportedVersion',
      currentVersion: __VERSION__,
      desiredVersion: version,
    };
  }

  computeNodeScore(x, scoreParams) {
    const {minValF, spreadF, maxBlock, maxFactor} = scoreParams;
    const currentBlock = x.currentSlot;

    // the node's position based on block count only
    const nonWeightedPosition = (currentBlock * 1.0) / (maxBlock * 1.0);

    // synthetic function for 'closeness' : sin(), which is max at middle of race
    const weightFactor = Math.sin(nonWeightedPosition * Math.PI) * maxFactor;

    const nodePosF =
      spreadF !== 0
        ? (x.activatedStake * 1.0 - minValF) / spreadF
        : Math.random();

    const weightShare = nodePosF * weightFactor;
    let weightedPosition = (nonWeightedPosition + weightShare) * 100.0;
    weightedPosition = Math.max(Math.floor(weightedPosition), 0);
    weightedPosition = Math.min(Math.ceil(weightedPosition), 100);

    return weightedPosition;
  }

  computeScoreParams(validators, isDemo, lastSlot, currentStage) {
    const firstStake =
      (validators && validators.length && validators[0].activatedStake) || 0;

    const [minVal, maxVal] = reduce((a, x) => {
      let stake = x.activatedStake;
      return [Math.min(a[0], stake), Math.max(a[1], stake)];
    })([firstStake, firstStake], validators);

    const maxValF = maxVal * 1.0; // the maximum observed stake
    const minValF = minVal * 1.0; // the minimum observed stake
    const spreadF = maxValF - minValF; // the spread between min and max

    const currentBlock = !isDemo ? lastSlot : new Date().getTime() % 60000;
    const maxBlock = !isDemo ? currentStage && currentStage.duration : 60000;

    // maximum weight factor
    const maxFactor = spreadF !== 0 ? 0.1 : 0.05;

    return {
      maxValF,
      minValF,
      spreadF,
      currentBlock,
      maxBlock,
      maxFactor,
    };
  }
}
