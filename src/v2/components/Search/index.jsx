// @flow
import React, {useState} from 'react';
import {observer} from 'mobx-react-lite';
import {compose, get, reduce, toLower, contains} from 'lodash/fp';
import {InputBase, IconButton} from '@material-ui/core';
import {Search as SearchIcon} from '@material-ui/icons';
import NodesStore from 'v2/stores/nodes';
import {MIN_TERM_LEN} from 'v2/constants';

import SearchResult from './result';
import useStyles from './styles';

const Search = () => {
  const classes = useStyles();
  const {validators} = NodesStore;
  const [query, setQuery] = useState('');
  const [isDirty, setDirty] = useState(false);
  const [isFocus, setFocus] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const onFocus = () => setFocus(true);
  const onBlur = () => {
    setTimeout(() => {
      setFocus(false);
    }, 250);
  };

  const handleClear = () => {
    setDirty(false);
    setQuery('');
    setSearchResult([]);
  };

  const handleSearch = ({currentTarget}: SyntheticEvent<HTMLInputElement>) => {
    const {value} = currentTarget;
    if (!value) {
      handleClear();
      return;
    }
    setQuery(value);
    if (value.length < MIN_TERM_LEN) {
      setDirty(false);
      setSearchResult([]);
      return;
    }

    const filteredValidators = reduce((acc, v) => {
      const lowerVal = toLower(value);
      if (
        compose(
          contains(lowerVal),
          toLower,
          get('nodePubkey'),
        )(v)
      ) {
        acc.push({...v, findText: get('nodePubkey')(v)});
        return acc;
      }
      if (
        compose(
          contains(lowerVal),
          toLower,
          get('identity.name'),
        )(v)
      ) {
        acc.push({...v, findText: get('identity.name')(v)});
        return acc;
      }
      if (
        compose(
          contains(lowerVal),
          toLower,
          get('identity.keybaseUsername'),
        )(v)
      ) {
        acc.push({...v, findText: get('identity.keybaseUsername')(v)});
        return acc;
      }
      return acc;
    }, [])(validators);
    setDirty(true);
    setSearchResult(filteredValidators);
  };

  return (
    <div className={classes.root}>
      <div className={classes.form}>
        <InputBase
          onFocus={onFocus}
          onBlur={onBlur}
          className={classes.input}
          placeholder="Search by validator address / keybase"
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          value={query}
          onChange={handleSearch}
        />
        <IconButton size="small" className={classes.btn}>
          <SearchIcon />
        </IconButton>
      </div>
      <SearchResult
        isDirty={isDirty}
        isFocus={isFocus}
        onClear={handleClear}
        items={searchResult}
      />
    </div>
  );
};

export default observer(Search);
