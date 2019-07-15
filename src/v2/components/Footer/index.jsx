import {Grid, Typography} from '@material-ui/core';
import React from 'react';
import Logo from 'v2/components/UI/Logo';

import Social from '../Social';
import Newsletter from './Newsletter';
import Partnership from './Partnership';
import useStyles from './styles';
import bg from './assets/bg.svg';
import bgSm from './assets/bg_sm.svg';

const version = process.env.REACT_APP_VERSION;

const Footer = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <picture>
        <source srcSet={bgSm} media="(max-width: 960px)" />
        <img className={classes.bg} src={bg} alt="" />
      </picture>
      <Grid container>
        <Grid item className={classes.left} xs={12} md={5}>
          <Logo vertical />
          <Newsletter />
          <Typography className={classes.copyright}>
            © Copyright Solana Labs, Inc. All rights reserved.
            <br />
            {version}
          </Typography>
        </Grid>
        <Grid item className={classes.right} xs={12} md={5}>
          <Partnership />
        </Grid>
        <Grid item xs={12} md={1}>
          <Social />
        </Grid>
      </Grid>
    </div>
  );
};

export default Footer;
