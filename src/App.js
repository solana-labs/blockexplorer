import React, {Component} from 'react';
import axios from 'axios';
import {Router} from 'react-router-dom';
import {
  createMuiTheme,
  MuiThemeProvider,
  withStyles,
} from '@material-ui/core/styles';
import {fade} from '@material-ui/core/styles/colorManipulator';
import Grid from '@material-ui/core/Grid';
import RobustWebSocket from 'robust-websocket';
import _ from 'lodash';
import {matchPath} from 'react-router';
import './App.css';
import createBrowserHistory from 'history/createBrowserHistory';

import EndpointConfig from './EndpointConfig';
import BxDataTable from './BxDataTable';
import BxTransactionChart from './BxTransactionChart';
import BxStatsTable from './BxStatsTable';
import BxDialog from './BxDialog';
import BxAppBar from './BxAppBar';

const history = createBrowserHistory();

const styles = theme => ({
  root: {
    width: '100%',
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.unit,
    top: theme.spacing.unit,
    color: theme.palette.grey[500],
  },
  link: {
    color: theme.palette.primary.light,
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
});

const BLOCK_EXPLORER_API_BASE = EndpointConfig.BLOCK_EXPLORER_API_BASE;

const BxAppBarThemed = withStyles(styles)(BxAppBar);
const BxDialogThemed = withStyles(styles)(BxDialog);
const BxStatsTableThemed = withStyles(styles)(BxStatsTable);
const BxTransactionChartThemed = withStyles(styles)(BxTransactionChart);
const BxDataTableThemed = withStyles(styles)(BxDataTable);

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#000000',
    },
  },
  typography: {useNextVariants: true},
});

class App extends Component {
  constructor(props) {
    super(props);

    this.ws = null;

    this.state = {
      enabled: true,
      dialogOpen: false,
      selectedValue: null,
      currentMatch: null,
      stateLoading: false,
      globalStats: {},
      txnStats: {},
      users: [],
      userState: {},
      transactions: [],
      blocks: [],
      entries: [],
    };

    const self = this;

    self.updateGlobalStats();
    setInterval(() => {
      self.updateGlobalStats();
    }, 1200);

    self.updateTxnStats();
    setInterval(() => {
      self.updateTxnStats();
    }, 22000);

    self.updateBlocks();

    //
    // POLLING vs. live
    //
    // setInterval(() => {
    //     self.updateBlocks();
    // }, 10000);
    //
    // self.updateEntries();
    // setInterval(() => {
    //     self.updateEntries();
    // }, 10000);

    self.updateTransactions();
    setInterval(() => {
      self.updateTransactions();
    }, 10000);
  }

  getRemoteState(attr, url, mapFun, limit) {
    axios.get(url).then(response => {
      let newState = {};

      if (limit) {
        response.data = response.data.slice(0, limit);
      }

      if (mapFun) {
        newState[attr] = _.map(response.data, mapFun);
      } else {
        newState[attr] = response.data;
      }

      this.updateStateAttributes(newState);
    });
  }

  updateSpecificGlobalStateAttribute(attr, value) {
    let globalStats = {...this.state.globalStats};
    globalStats[attr] = value;

    this.updateStateAttributes({globalStats: globalStats});
  }

  updateStateAttributes(attrMap) {
    let newState = {...this.state};

    _.forEach(attrMap, (v, k) => {
      newState[k] = v;
    });

    this.setState(() => {
      return newState;
    });
  }

  updateGlobalStats() {
    this.getRemoteState(
      'globalStats',
      `http:${BLOCK_EXPLORER_API_BASE}/global-stats`,
    );
  }

  updateTxnStats() {
    this.getRemoteState(
      'txnStats',
      `http:${BLOCK_EXPLORER_API_BASE}/txn-stats`,
    );
  }

  updateBlocks() {
    if (!this.state.enabled) {
      return;
    }

    let blkFun = v => {
      let newObj = {};
      let fields = v.split('#');

      newObj.t = 'blk';
      newObj.h = fields[0];
      newObj.l = fields[1];
      newObj.s = fields[2];
      newObj.dt = fields[3];
      newObj.id = fields[4];

      return newObj;
    };

    this.getRemoteState(
      'blocks',
      `http:${BLOCK_EXPLORER_API_BASE}/blk-timeline`,
      blkFun,
      10,
    );
  }

  updateEntries() {
    if (!this.state.enabled) {
      return;
    }

    let entFun = v => {
      let newObj = {};
      let fields = v.split('#');

      newObj.t = 'ent';
      newObj.h = fields[0];
      newObj.l = fields[1];
      newObj.s = fields[2];
      newObj.dt = fields[3];
      newObj.id = fields[4];
      newObj.txn_count = parseInt(fields[5] || '0');

      return newObj;
    };

    this.getRemoteState(
      'entries',
      `http:${BLOCK_EXPLORER_API_BASE}/ent-timeline`,
      entFun,
      10,
    );
  }

  updateTransactions() {
    if (!this.state.enabled) {
      return;
    }

    let txnFun = v => {
      let newObj = {};
      let fields = v.split('#');

      newObj.t = 'txn';
      newObj.h = fields[0];
      newObj.l = fields[1];
      newObj.s = fields[2];
      newObj.dt = fields[3];
      newObj.entry_id = fields[4];
      newObj.id = fields[5];

      return newObj;
    };

    this.getRemoteState(
      'transactions',
      `http:${BLOCK_EXPLORER_API_BASE}/txn-timeline`,
      txnFun,
      10,
    );
  }

  handleLocationChange = () => location => {
    if (location.pathname === '/' && this.selectedValue !== null) {
      this.updateStateAttributes({
        selectedValue: null,
        dialogOpen: false,
        currentMatch: null,
        stateLoading: false,
      });
    }

    if (location.pathname !== '/') {
      let pathMatch = matchPath(window.location.pathname, {
        path: '/:type/:id',
        exact: false,
        strict: false,
      });

      if (pathMatch) {
        this.handleClickOpen(pathMatch.params.id, pathMatch.params.type)();
        this.updateStateAttributes({
          currentMatch: pathMatch,
          stateLoading: true,
        });
      }
    }
  };

  componentDidMount() {
    const self = this;

    let ws = new RobustWebSocket(`ws:${BLOCK_EXPLORER_API_BASE}/`);

    ws.addEventListener('open', function() {
      ws.send('<client_hello>');
    });

    ws.addEventListener('message', function(event) {
      if (!self.state.enabled) {
        return;
      }

      self.onMessage(JSON.parse(event.data));
    });

    this.ws = ws;

    let locationListener = this.handleLocationChange();

    history.listen(locationListener);
    locationListener(window.location);
  }

  componentWillUnmount() {
    if (this.ws) {
      this.ws.close();
    }
  }

  onMessage = data => {
    if (!this.state.enabled) {
      return;
    }

    let type = data.t;
    let message = data.m;
    let fields = message.split('#');

    if (type === 'blk') {
      let block = {
        t: 'blk',
        h: parseInt(fields[0]),
        l: fields[1],
        s: parseInt(fields[2]),
        dt: fields[3],
        id: fields[4],
      };

      this.addBlock(block);
    }

    if (type === 'ent') {
      let entry = {
        t: 'ent',
        h: parseInt(fields[0]),
        l: fields[1],
        s: parseInt(fields[2]),
        dt: fields[3],
        id: fields[4],
        txn_count: parseInt(fields[5]),
      };

      this.addEntry(entry);
    }
  };

  addEntry(entry) {
    let entries = [...this.state.entries];

    if (entries.length >= 10) {
      entries.pop();
    }

    entries.unshift(entry);

    this.updateStateAttributes({entries: entries});

    if (entry.h > this.state.globalStats['!ent-height']) {
      this.updateSpecificGlobalStateAttribute('!ent-height', entry.h);
    }

    if (entry.dt > this.state.globalStats['!ent-last-dt']) {
      this.updateSpecificGlobalStateAttribute('!ent-last-dt', entry.dt);
    }
  }

  addBlock(block) {
    let blocks = [...this.state.blocks];

    if (blocks.length >= 10) {
      blocks.pop();
    }

    blocks.unshift(block);

    this.updateStateAttributes({blocks: blocks});

    if (block.s > this.state.globalStats['!blk-slot']) {
      this.updateSpecificGlobalStateAttribute('!blk-slot', block.s);
    }
  }

  handleDialogClose = () => {
    this.updateStateAttributes({
      selectedValue: null,
      dialogOpen: false,
      currentMatch: null,
      stateLoading: false,
    });
    history.push('/');
  };

  toggleEnabled = self => event => {
    if (event.target.checked === self.state.enabled) {
      return;
    }

    this.updateStateAttributes({
      enabled: event.target.checked,
    });
  };

  handleSearch = () => event => {
    let value = event.target.value;
    event.target.value = '';

    if (value.length > 80) {
      history.push(`/txn/${value}`);
      return;
    }

    history.push(`/ent/${value}`);
    return;
  };

  handleClickOpen = (value, type) => () => {
    let mkUrl = (id, type) => {
      let url = null;

      if (type === 'txn') {
        url = `${BLOCK_EXPLORER_API_BASE}/txn/${id}`;
      }

      if (type === 'ent') {
        url = `${BLOCK_EXPLORER_API_BASE}/ent/${id}`;
      }

      if (type === 'blk') {
        url = `${BLOCK_EXPLORER_API_BASE}/blk/${id}`;
      }

      return url;
    };

    let url = mkUrl(value, type);

    const self = this;

    let updateState = newVal => {
      self.updateStateAttributes({
        selectedValue: newVal,
        dialogOpen: true,
        stateLoading: false,
      });
    };

    axios
      .get(url)
      .then(response => {
        updateState(response.data);
      })
      .catch(() => {
        history.goBack();
      });
  };

  render() {
    const self = this;

    return (
      <MuiThemeProvider theme={theme}>
        <Router history={history}>
          <div className="App">
            <BxAppBarThemed
              handleSearch={self.handleSearch(self)}
              enabled={this.state.enabled}
              handleSwitch={this.toggleEnabled(self)}
            />
            <div>
              <BxDialogThemed
                selectedValue={this.state.selectedValue}
                open={this.state.dialogOpen}
                onClose={this.handleDialogClose}
              />
            </div>
            <p />
            <BxStatsTableThemed globalStats={this.state.globalStats} />
            <p />
            <BxTransactionChartThemed txnStats={this.state.txnStats} />
            <p />
            <Grid container spacing={16} justify="center">
              <Grid item style={{width: '1460px'}}>
                <BxDataTableThemed
                  dataType="blk"
                  dataItems={this.state.blocks}
                />
              </Grid>
            </Grid>
            <Grid container spacing={16} justify="center">
              <Grid item style={{width: '1460px'}}>
                <BxDataTableThemed
                  dataType="ent"
                  dataItems={this.state.entries}
                />
              </Grid>
            </Grid>
            <Grid container spacing={16} justify="center">
              <Grid item style={{width: '1460px'}}>
                <BxDataTableThemed
                  dataType="txn"
                  dataItems={this.state.transactions}
                />
              </Grid>
            </Grid>
            <p />
          </div>
        </Router>
      </MuiThemeProvider>
    );
  }
}

export default App;
