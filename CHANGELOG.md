# Qurro changelog

## Next Qurro release (date TBD)
### Features added
### Backward-incompatible changes
### Bug fixes
### Performance enhancements
### Miscellaneous
- For searching by the values of a given feature ranking, the header shown
  above all of the ranking column names said `Feature Rankings`.
  This was slightly misleading, since searching is being done on the
  magnitudes of each ranking column for each feature (i.e. based on the
  y-axis values shown in the rank plot). To make things clearer, this header
  has been changed from `Feature Rankings` to `Feature Ranking Magnitudes`.


## Qurro 0.4.0 (August 15, 2019)
### Features added
- Started using Bootstrap (v4.3.1) for styling the Qurro visualization
  interface. Although the functionality available in Qurro is still the same,
  this interface has received a significant makeover. The bulk of these
  cosmetic interface changes are not documented here.
- Added light "grid lines" to the Qurro visualization interface. These clearly
  split up the interface into four distinct sections (rank plot, sample plot,
  selected features, selecting features), making it clearer how the interface
  is structured.
### Backward-incompatible changes
### Bug fixes
- Fixed some problems in how the plots were aligned/positioned in the interface.
  Now, both plots should "float" toward the middle of the screen, as intended.
  Also removed some unused whitespace around these plots (the grid lines helped
  here).
### Performance enhancements
### Miscellaneous
- Adjusted some of the default titles in Qurro's plots to make things clearer
  and simpler:
    - Rank plot title: `Feature Ranks` --> `Features`
    - Rank plot x-axis title: `Sorted Features` --> `Feature Rankings`
    - Sample plot title: `Log-Ratios of Abundances in Samples` --> `Samples`
    - Sample plot y-axis title: `log(Numerator / Denominator)` --> `Current Log-Ratio`
- Renamed the text-searching options in the search type menu (again). This change
  reflects these options' case insensitivity as of the previous version (v0.3.0).
    - `contains the exact text` --> `contains the text`
    - `contains the exact separated text fragment(s)` --> `contains the separated text fragment(s)`
- The text boxes describing the currently-selected numerator / denominator
  features are now "read-only" (you can't edit them while using Qurro). This
  should remove any vulnerability to accidental edits of these text boxes.
- Cleaned up various parts of Qurro's documentation to specify that
  feature rankings are what you get from sorting differentials/feature
  loadings, not just the literal differentials/feature loadings.
- Reworded the text in the info box in the "Selecting Features" section of
  the Qurro interface ("To construct a log-ratio...")
- Modified the "testing dependencies" section of the README to correctly
  specify the minimum version of QIIME 2 needed.
- Various improvements to the moving pictures tutorial.
- Modifed Qurro's python package description to say "**differentially** ranked
  features" instead of just "ranked features."
- Darkened the color of the "divider" between the numerator and denominator
  features text boxes, in order to distinguish it from the grid lines.
- Removed dependency on [Reset CSS](https://meyerweb.com/eric/tools/css/reset/).
- Temporarily pinned the required version of Altair at `3.1.0`, to ensure
  consistency between the Vega-Lite specifications generated and the Vega\*
  versions used by Qurro.
- Various minor updates to Qurro's documentation.


## Qurro 0.3.0 (August 3, 2019)
### Features added
- Now, Songbird no longer needs to be installed in order for the `qiime qurro
  supervised-rank-plot` action (**NOTE: this action has been renamed to `qiime
  qurro differential-plot`, see below**) to be available.
  ([#154](https://github.com/biocore/qurro/issues/154))
    - **NOTE: this means that Qurro v0.3.0 will not work with pre-2019.7
      versions of QIIME 2. See the "Backward-incompatible changes" section
      below for details.**
- Feature ranking values (i.e. differentials or loadings) are now shown in the
  tooltips for individual features in the rank plot.
  ([#186](https://github.com/biocore/qurro/issues/186))
- Added feature rankings as searchable fields in the "Selecting Features"
  controls. ([#97](https://github.com/biocore/qurro/issues/97))
- Feature metadata fields and feature ranking fields are now grouped under
  `Feature Metadata` or `Feature Ranking` headers in the searchable fields
  dropdowns. ([#191](https://github.com/biocore/qurro/issues/191))
- **Added numeric searching**: now you can search through numeric feature
  metadata or feature rankings using basic comparison operators. (Non-numeric
  input search text will result in the search not identifying any features,
  and non-numeric feature metadata values for the specified field will just
  be ignored in searching.)
  ([#141](https://github.com/biocore/qurro/issues/141),
  [#97](https://github.com/biocore/qurro/issues/97))
- Added a `--version` parameter to the standalone (i.e. outside of QIIME 2)
  Qurro interface. You can now check the currently installed Qurro version by
  running `qurro --version`. (There's already a `--version` parameter for the
  QIIME 2 Qurro plugin; this can be accessed using `qiime qurro --version`.)
- Sample metadata fields are now ordered alphabetically (and ignoring case) in
  the `x-axis field` and `color field` dropdowns in the sample plot controls.
  ([#76](https://github.com/biocore/qurro/issues/76))
- The fractions of selected features out of the total amount of features in the
  rank plot are now displayed in the numerator and denominator "headers."
  ([#187](https://github.com/biocore/qurro/issues/187))
- Replaced the `Bar width` dropdown with a slider input that lets you easily
  adjust the bar width (in addition to a checkbox that controls whether or not
  the bar widths are fitted to the available width).
    - The range of this slider is 1 pixel per bar to 10 pixels per bar. Note
      that the maximum bar width (when not using the "Fit bar widths" option)
      has been increased from 3 pixels to 10 pixels.
    - Renamed the `Fit bar widths to display width` option to say `Fit bar
      widths to the plot's default width?`. This is a more accurate description
      of what this option does.
- More output messages are now used when running Qurro. In particular, the
  following events will now trigger output messages:
    - Empty samples and/or features being automatically removed
    - Features in the table that weren't in the feature rankings being
      automatically removed
    - Samples in the table that weren't in the sample metadata being
      automatically removed (the opposite situation -- samples in the metadata
      that weren't in the table -- already would trigger output messages,
      though).
    - More context regarding the details of feature filtering, if specified via
      the `-x`/`--extreme-feature-count`/`--p-extreme-feature-count` option.
  These output messages will show up normally when running Qurro standalone or
  when using the `--verbose` option when running Qurro through QIIME 2.
- Added a `--p-debug` option when running Qurro through QIIME 2. This will
  cause debug messages to be output when the `--verbose` flag has also been
  specified to QIIME 2. (Non-debug output messages -- for example, the print
  messages described above -- will be output when `--verbose` has been
  specified to QIIME 2, but regardless of whether or not `--p-debug` has been
  specified.)
  ([#95](https://github.com/biocore/qurro/issues/95))
### Backward-incompatible changes
- Qurro will now try to load the `Differential` type from q2-types.
  ([#154](https://github.com/biocore/qurro/issues/154))
    - **This means that Qurro v0.3.0 will only support versions of QIIME 2 of
      at least 2019.7.**
    - **This also means that installing Qurro v0.3.0 into an old QIIME 2
      environment will break it.**
- Renamed Qurro's QIIME 2 actions ([#98](https://github.com/biocore/qurro/issues/98)):
    - **Renamed `qiime qurro supervised-rank-plot` to `qiime qurro differential-plot`.**
    - **Renamed `qiime qurro unsupervised-rank-plot` to `qiime qurro loading-plot`.**
- **Text searches are now case-insensitive!** You can now search through
  features' taxonomies for, say, `p__firmicutes`, and results for
  `p__Firmicutes` will show up.
  ([#30](https://github.com/biocore/qurro/issues/30))
- Replaced `-v`/`--verbose` in Qurro's standalone script with `--debug`, in
  order to be consistent with Qurro's QIIME 2 plugin.
### Bug fixes
- A clear error is now raised if the feature rankings or feature metadata
  include a column named `qurro_x`. (This column name is used internally by
  Qurro to sort features in the rank plot.)
  ([#183](https://github.com/biocore/qurro/issues/183))
  Before, input datasets with this column name would have caused either the
  loss of this column of data or confusing errors.
- Previously, there was a small (either almost or entirely impossible) chance
  that all of the main data within the rank or sample plot JSON could get
  overwritten due to a collision in the dataset name. Although this should
  basically never happen anyway, Qurro's code now checks for this scenario and
  raises an error accordingly.
  ([#190](https://github.com/biocore/qurro/issues/190))
- QIIME 2 comment lines in differentials TSV files are now properly handled
  when running Qurro outside of QIIME 2.
    - Before this fix, trying to use a differentials file in standalone Qurro
      that included #q2:types comments would cause Qurro to crash.
      ...However, I'm pretty sure no differentials files including these
      sorts of comment lines were in use until the release of QIIME 2 2019.7 a
      few days ago, so I doubt this has been a big problem for anyone.
### Performance enhancements
### Miscellaneous
- Added a draft "Moving Pictures" tutorial.
- When replacing certain characters within column names, Qurro no longer
  replaces `'` or `"` characters with <code>\|</code> characters. Instead, `'`
  and `"` characters are just removed from column names entirely.
- Updated the rank plot's y-axis to say `Magnitude: [ranking name]` instead of
  `Rank: [ranking name]`.
  ([#194](https://github.com/biocore/qurro/issues/194))
- Replaced uses of `log ratio` with `log-ratio` throughout Qurro's code and
  documentation.
- On the [Qurro website](https://biocore.github.io/qurro/):
  - Added a "Mackerel" demo (based on the output of [this](https://github.com/knightlab-analyses/qurro-mackerel-analysis/) analysis), and associated with data from [this paper](https://www.biorxiv.org/content/10.1101/721555v1).
  - Replaced "OTUs" for the Moving Pictures and Sleep Apnea demo dataset
    feature types with "ASVs / sOTUs".
  - Replaced "OTUs" for the Byrd dataset feature type with "Taxa".
  - Cleaned up the Byrd demo's dataset citation (to reflect the fact that the
    Morton/Marotz et al. 2019 paper is now published).
  - Removed the now-incomplete "tutorials" section, in favor of just linking to
    Qurro's GitHub page.
- DEICODE ordinations used in demos and test inputs have been rerun with
  DEICODE version 0.2.3.
  ([#188](https://github.com/biocore/qurro/issues/188))
- Cleaned up Qurro's command-line interface options and help text.
- When exporting data in the sample plot, the default filename is now just
  `sample_plot_data.tsv` instead of `rrv_sample_plot_data.tsv`. (The prior
  default filename dates back to when Qurro was named "rankratioviz.")
- A clear error is now raised if Qurro is trying to parse a GNPS feature
  metadata file, and the feature rankings include a column named `LibraryID`.
  This sort of error should already have come up in prior versions of Qurro,
  but now it will come up a bit earlier (and use a clearer message indicating
  what's going on).
- Slightly changed the warning message produced when there are
  indistinguishable rows in a GNPS feature metadata file (now this message is
  no longer prefixed with something like `WARNING:root:`).
- The output message letting the user know about samples in the sample metadata
  that are not also in the BIOM table has been shortened a bit (now it doesn't
  start with `NOTE: `).
- Changed the error message when no samples are shared between the sample
  metadata file and BIOM table to be a bit clearer:
  - **Before:** `None of the samples in the sample metadata file are present in the input BIOM table.`
  - **After:** `No samples are shared between the sample metadata file and BIOM table.`
  - The earlier message wasn't technically wrong, but the new message is more
    direct (and more indicative of what's going on behind the scenes).
- In the sample plot Vega-Lite JSON generated by Qurro, samples are no longer
  sorted by their IDs. (This is just an internal change, and shouldn't affect
  Qurro's behavior at all.)
- Updated the "README.txt" file located in the Byrd et al. test data folder to
  make it clearer that the differentials used here are equivalent to those used
  in the Morton/Marotz et al. 2019 analysis
  (https://github.com/knightlab-analyses/reference-frames).
- Reran Songbird on the Red Sea dataset in consultation with Tensorboard to
  verify that the model fit was reasonable. I changed some of the
  hyperparameters around a bit; I added a README.txt file to the Red Sea test
  data folder detailing this process, and also updated the Songbird Jupyter
  Notebook accordingly.
- Removed some unused images from the `screenshots/` directory of Qurro's
  code repository.
- Updated the screenshot used in the README.
- Various other small updates to Qurro's code and documentation.
  ([#184](https://github.com/biocore/qurro/issues/184))


## Qurro 0.2.1 (July 10, 2019)
### Features added
### Backward-incompatible changes
### Bug fixes
- Allowed "exact text" searching (the first search option) using just
  whitespace.
### Performance enhancements
- Removed some unused data from `qurro/tests/`.
### Miscellaneous
- Updated a bunch of links throughout Qurro's code and documentation to point
  to its new repository home (https://github.com/biocore/qurro).
- Renamed the `Regenerate sample plot` button to say `Regenerate plots` (this
  name makes more sense).


## Qurro 0.2.0 (July 8, 2019)
### Features added
- The color schemes used in the sample plot and rank plot are now customizable!
  ([#158](https://github.com/biocore/qurro/issues/158))

- Feature loading names (in Qurro plots produced from DEICODE biplots) are now
  clearer: instead of being labelled `0`, `1`, `2`, etc., the loadings are now
  labelled `Axis 1`, `Axis 2`, `Axis 3`, etc.
  ([#145](https://github.com/biocore/qurro/issues/145))

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
  ([#79](https://github.com/biocore/qurro/issues/79))

- Previously, the use of certain column names in sample metadata, feature
  metadata, or feature rankings would cause either confusing errors or the loss
  of some metadata/ranking fields in a Qurro visualization. Now, these sorts of
  problematic names will just lead to a clear error message when generating a
  Qurro visualization.
    - See [#55](https://github.com/biocore/qurro/issues/55) for details about
      which column names cause problems (at this point, most ordinary inputs
      shouldn't run into any problems). Since problematic names will now lead
      to an error message explaining what's wrong, there shouldn't be any need
      to worry about this.

- Qurro should now throw an error if an input GNPS feature metadata file
  doesn't have `parent mass`, `RTConsensus`, and `LibraryID` columns.

### Performance enhancements
- Now, Qurro's JavaScript code uses a sparse representation of the count data
  (previously it used a dense represntation). For inherently sparse datasets
  (like many microbiome datasets), this should result in faster loading times
  in the browser (as well as smaller Qurro visualizations).
  ([#58](https://github.com/biocore/qurro/issues/58))

- Significant speedups on how the input data is filtered and matched.
  ([#172](https://github.com/biocore/qurro/issues/172))

- Now, empty features are removed from Qurro visualizations (in addition to
  empty samples). Similarly to the sparsity change above, this should make
  Qurro visualizations load faster in the browser, decrease their filesizes,
  and reduce the amount of features on the rank plot (for datasets containing
  empty features). This has affected the Byrd et al. demo.
  ([#171](https://github.com/biocore/qurro/issues/171))

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
  ([#176](https://github.com/biocore/qurro/issues/176))
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
