# Contributing to Qurro's codebase

If you'd like to make changes to Qurro's codebase, here's how you'd do that.
**Note that these are very in-progress instructions** -- if you have any
questions, feel free to file an issue in this repository or email the Qurro
development team.

## Setting up a development environment

1. Fork Qurro.
1. Clone your fork of Qurro's source code to your computer.
2. Create a development conda environment for Qurro:
    1. Install the latest version of QIIME 2 natively,
       [as you would normally](https://docs.qiime2.org/2019.4/install/native/).
    2. In a terminal, navigate to the folder to which you cloned your fork of
       Qurro's source code above. Run `pip install -e .[dev]` inside this folder to
       install Qurro along with its normal and development Python dependencies.
    3. Install songbird using `conda install -c conda-forge songbird`. This is
       required to get Qurro to recognize the `FeatureData[Differential]` type
       (note that this is a temporary requirement, and should be unnecessary
       after QIIME 2 version 2019.7 is released).
    4. Install the various Node.js requirements for testing Qurro's JavaScript
       code. This can be done by running
       `npm install -g mocha-headless-chrome jshint prettier nyc`. Note that
       this will install these programs globally on your system.
3. Run the following commands to verify everything was installed correctly:
```bash
qiime dev refresh-cache
make test
make stylecheck
```
If these commands succeed, then you can start making changes to Qurro.

## Before submitting a pull request to Qurro

You should check that 1) all the tests pass (i.e. `make test` succeeds),
and 2) the code is properly formatted (i.e. `make stylecheck` succeeds). If
you'd like to fix the code's formatting automatically, you can just run
`make style`.

## Acknowledgements

This document was loosely based on Emperor's [CONTRIBUTING.md file](https://github.com/biocore/emperor/blob/new-api/CONTRIBUTING.md).
