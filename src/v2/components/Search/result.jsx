// @flow
import React, {memo} from 'react';
import {map} from 'lodash/fp';
import {Link} from 'react-router-dom';
import type {Validator} from 'v2/@types/validator';
import MixPanel from 'v2/mixpanel';

import useStyles from './styles';

type SearchResultProps = {
  items: Validator[],
  onClear: () => void,
  isDirty: boolean,
  isFocus: boolean,
};

const SearchResult = ({
  isDirty,
  isFocus,
  items,
  onClear,
}: SearchResultProps) => {
  const classes = useStyles();

  const renderItem = ({
    findText,
    nodePubkey,
  }: {
    findText: string,
    nodePubkey: string,
  }) => {
    const handleClick = () => {
      onClear();
      MixPanel.track('Click Search Dropdown', {nodePubkey});
    };

    return (
      <li className={classes.item} key={nodePubkey}>
        <Link onClick={handleClick} to={`/validators/${nodePubkey}`}>
          {findText}
        </Link>
      </li>
    );
  };
  if ((!isDirty && !items.length) || !isFocus) {
    return null;
  }

  return (
    <div className={classes.list}>
      <div className={classes.title}>
        {!items.length
          ? 'There were no results for this search term.'
          : 'Validators'}
      </div>
      <ul>{map(renderItem)(items)}</ul>
    </div>
  );
};

export default memo(SearchResult);
