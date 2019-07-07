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
- Changed the behavior of how Qurro (when run outside of QIIME 2) writes out
  files. Now, existing files/directories in the specified `-o`/`--output-dir`
  will be overwritten if necessary (previously, individual files would be
  overwritten but directories would cause an error to be thrown).
  ([#79](https://github.com/fedarko/qurro/issues/79))
### Performance enhancements
- Now, Qurro's JavaScript code uses a sparse representation of the count data
  (previously it used a dense represntation). For inherently sparse datasets
  (like many microbiome datasets), this should result in faster loading times
  in the browser (as well as smaller Qurro visualizations).
  ([#58](https://github.com/fedarko/qurro/issues/58))
- Significant speedups on how the input data is filtered and matched.
  ([#172](https://github.com/fedarko/qurro/issues/172))
- Now, empty features are removed from Qurro visualizations (in addition to
  empty samples). Similarly to the sparsity change above, this should make
  Qurro visualizations load faster in the browser, decrease their filesizes,
  and reduce the amount of features on the rank plot (for datasets containing
  empty features). This has affected the Byrd et al. demo.
  ([#171](https://github.com/fedarko/qurro/issues/171))
- Removed an unused JS file from Qurro's `support_files/`. This change should
  decrease the size of Qurro's generated visualizations by a small amount.
### Miscellaneous 
- Changed the search type menus to be a bit more clear about what they're doing
  under the hood:
    - `contains the text` --> `contains the exact text`
    - `contains the exact taxonomic rank(s)` --> `contains the exact separated text fragment(s)`
- Previously, the `Export currently used data` button would only export
  information about samples with valid current log ratios (however, samples
  with invalid metadata fields were still included). This behavior has been
  changed so that all samples -- regardless of their log ratio or other fields'
  validity -- are included in the .tsv output.
  ([#176](https://github.com/fedarko/qurro/issues/176))
    - Also, the exported sample data will now include field information about
      the sample plot's current color field in addition to the sample plot's
      current x-axis field.
    - Furthermore, redundant fields are now shown in the exported data -- so
      if you set the x-axis and color fields for the sample plot to both be
      `Sample ID`, you'll see three `Sample ID` columns in the exported data.
    - Note that invalid log ratios (as well as empty/missing metadata fields,
      as before) will be shown as `null` values in the exported sample data.
    - The button's name has also been changed to `Export sample data`, to make
      its behavior clearer.
- Added citation instructions and some small documentation fixes to the README
- Fixed a typo in the license (forgot to update this when we renamed the tool
  to "Qurro" a few weeks ago)
- Cleaned up/updated some of Qurro's basic documentation (in its `setup.py`,
  example Jupyter Notebooks, etc.).
- Updated the screenshot used in the README.
- Various improvements to Qurro's code and tests.

## Qurro 0.1.0 (June 25, 2019)
- Released the first version of Qurro [on PyPI](https://pypi.org/project/qurro/)!
