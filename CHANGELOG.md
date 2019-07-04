# Qurro changelog

## Qurro 0.2.0 (in development)
### Features added
- The color schemes used in the sample plot and rank plot are now customizable!
  ([#158](https://github.com/fedarko/qurro/issues/158))

- Feature loading names (in Qurro plots produced from DEICODE biplots) are now
  clearer: instead of being labelled `0`, `1`, `2`, etc., the loadings are now
  labelled `Axis 1`, `Axis 2`, `Axis 3`, etc.
  ([#145](https://github.com/fedarko/qurro/issues/145))
### Backward-incompatible changes
### Bug fixes
- Ensured that missing feature metadata values, and samples' initial balances
  (aka log ratios), were set to `None` instead of `NaN` when being passed to
  Altair. (In practice this wasn't causing any problems, since Altair converts
  NaN values to None values, but Qurro should at least be more internally
  consistent now.)
### Performance enhancements
- Significant speedups on how the input data is filtered and matched.
  ([#172](https://github.com/fedarko/qurro/issues/172))
- Removed an unused JS file from Qurro's `support_files/`. This change should
  decrease the size of Qurro's generated visualizations by a small amount.
### Miscellaneous 
- Added citation instructions and some small documentation fixes to the README
- Fixed a typo in the license (forgot to update this when we renamed the tool
  to "Qurro" a few weeks ago)
- Cleaned up/updated some of Qurro's basic documentation (in its `setup.py`,
  example Jupyter Notebooks, etc.).
- Updated the screenshot used in the README.
- Various improvements to Qurro's code and tests.

## Qurro 0.1.0 (June 25, 2019)
- Released the first version of Qurro [on PyPI](https://pypi.org/project/qurro/)!
