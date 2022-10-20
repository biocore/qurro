# Qurro changelog

## Qurro 0.8.0 (October 19, 2022)
### Features added
- Add an option to Qurro's visualization interface to exclude metadata columns
  from the "sample plot data" output TSV
  ([#306](https://github.com/biocore/qurro/issues/306),
  [#313](https://github.com/biocore/qurro/pull/313)).
  - This should make it easier to merge the sample log-ratios exported from
    Qurro with a sample metadata file -- since now these metadata columns won't
    be duplicated, which would cause problems. (This problem comes up in
    [Gemelli](https://github.com/biocore/gemelli)'s tutorials.)
### Backward-incompatible changes
- Switched the required pandas version from `>= 0.24.0, <1` to `>= 1`.
  **This makes Qurro now compatible with QIIME 2 versions `>= 2020.11`!**
  - However, this change removes support for older QIIME 2 versions. (It may be
    possible to get this version of Qurro installed into an older QIIME 2
    environment, but we do not explicitly support this.)
  - Notably, Songbird has not yet made the shift to pandas `>= 1`, so Songbird
    and Qurro will need to be installed into separate environments; the "Red
    Sea" example notebook details this process.
- Updated a few other dependency versions to fix various problems (e.g.
  explicitly requiring SciPy and pinning it to `scipy < 1.9.0` to fix
  [this scikit-bio issue](https://github.com/biocore/scikit-bio/issues/1818),
  removing Black from the development dependencies for reasons discussed in
  [`CONTRIBUTING.md`](https://github.com/biocore/qurro/blob/master/CONTRIBUTING.md)).
### Bug fixes
### Performance enhancements
### Miscellaneous
- Improve various parts of Qurro's code to remove various warnings (for
  example, about certain things being deprecated).
- Update Qurro's example notebooks:
  - Updated the "Red Sea" notebook to explain how to use
    Songbird and Qurro in different conda environments.
  - Updated the "ALDEx2" notebook to explain how we recommend installing ALDEx2
    nowadays.
- Updated the documentation to refer to the published version of the Mackerel
  data's paper ([Minich et al. 2020](https://journals.asm.org/doi/full/10.1128/mSphere.00401-20)).
- Fixing various broken links in the documentation
  ([#318](https://github.com/biocore/qurro/pull/318),
  [#320](https://github.com/biocore/qurro/pull/320)).
- Ported Qurro's continuous integration from Travis CI to GitHub Actions
  ([#316](https://github.com/biocore/qurro/issues/316)).
- Improved Qurro's continuous integration in multiple ways:
  - Test on multiple QIIME 2 versions.
  - Test the standalone Qurro functionality on multiple Python versions.
  - Test the standalone Qurro functionality in a non-QIIME-2 environment
    (similar to EMPress' "standalone" CI).
- Updated the development documentation regarding the minimum QIIME 2 version,
  dependency version issues, etc.

## Qurro 0.7.1 (May 22, 2020)
### Features added
### Backward-incompatible changes
### Bug fixes
### Performance enhancements
### Miscellaneous
- Small documentation updates, including updating the color composition tutorial
  about the minimum python version needed
  ([#295](https://github.com/biocore/qurro/issues/295)).
- Added citation information to Qurro's QIIME 2 plugin -- you can now
  run `qiime qurro --citations`, and citation information for Qurro-generated
  QZVs is now shown with other citation information at places like
  `view.qiime2.org`.

## Qurro 0.7.0 (May 4, 2020)
### Features added
- Added the ability to **easily search using multiple text queries at once**:
  this is done using the `contains text separated by | (pipe)` searching
  option. You can pass in, e.g. `abc | def | ghi` to select any features where
  the selected field contains at least one of `abc`, `def`, or `ghi`.
  ([#224](https://github.com/biocore/qurro/issues/224))
  - This works more intuitively than the `separated text fragment(s)` option,
    and should be useful for a few cases that that option can't handle (e.g.
    polyphyletic taxa, as discussed in issue 224).
- Added a **`Draw borders on scatterplot points?` checkbox**, which is useful for making
  light-colored points in the sample plot easier to see on the white background.
  ([#240](https://github.com/biocore/qurro/issues/240))
- Added the ability to **enter in negative numbers in autoselection** to flip
  the selection (selecting the numerator from the lowest-ranked features and
  the denominator from the highest-ranked features).
  ([#264](https://github.com/biocore/qurro/issues/264))
- Added the **`Classic QIIME Colors` categorical color scheme** used in some other
  visualization tools, including [Emperor](https://biocore.github.io/emperor/)
  and [Empress](https://github.com/biocore/empress), to the sample plot's
  categorical color scheme options.
  ([#300](https://github.com/biocore/qurro/issues/300))
  - (`tableau10` is still the default categorical color scheme in Qurro, though.)
- Added a **["selection" tutorial](https://nbviewer.jupyter.org/github/biocore/qurro/blob/master/example_notebooks/selection/selection.ipynb)**
  describing the various ways of selecting features in Qurro in detail.
  ([#123](https://github.com/biocore/qurro/issues/123))
  - (This was previously the appendix in the moving pictures tutorial, but now
    it's been split off and expanded into its own thing.)
### Backward-incompatible changes
- For the time being, we are only supporting Qurro for Python versions of **at
  least 3.6 and less than 3.8**. The code hasn't really changed, but this seems
  like it'll be the simplest option for maintenance in the short term.
### Bug fixes
- Previously, the autoselection number field had an implicit "step size" of 1.
  I don't think this should have prevented users from entering in
  floating-point numbers here, but some people's browsers may have complained
  on seeing a floating-point number. This problem should be resolved now.
  (See [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/number#step) for details about this.)
### Performance enhancements
### Miscellaneous
- Qurro is now installable on conda through the conda-forge channel!
  ([#153](https://github.com/biocore/qurro/issues/153))
- Various minor documentation updates, including adding citation info for
  Qurro's recently-published paper to the README.
  ([#169](https://github.com/biocore/qurro/issues/169))

## Qurro 0.6.0 (March 10, 2020)
### Features added
- Added **tooltips** throughout the Qurro interface explaining what certain
  controls do. Just hover your mouse over one of the "?" icons to view the
  tooltips! ([#225](https://github.com/biocore/qurro/issues/225),
  [#123](https://github.com/biocore/qurro/issues/123))
  - Although this is a pretty common user-interface thing, our particular use
    of this was inspired by [Bandage](https://rrwick.github.io/Bandage/)'s
    similar tooltips.
- Added two **comprehensive tutorials** explaining how to use Qurro with
  certain types of data: ([#267](https://github.com/biocore/qurro/issues/267))
  - [With transcriptomics data](https://nbviewer.jupyter.org/github/biocore/qurro/blob/master/example_notebooks/ALDEx2_TCGA_LUSC/transcriptomic_example.ipynb), courtesy of [@gibsramen](http://github.com/gibsramen/)
  - [With arbitrary compositional data](https://nbviewer.jupyter.org/github/biocore/qurro/blob/master/example_notebooks/color_compositions/color_example.ipynb), courtesy of [@cameronmartino](http://github.com/cameronmartino/)
- Updated the [**moving pictures tutorial**](https://nbviewer.jupyter.org/github/biocore/qurro/blob/master/example_notebooks/moving_pictures/moving_pictures.ipynb), after a long drought since the last update!
  - The newest version of the tutorial has more details, more useful examples,
    demonstrates using the latest version of Qurro, and has been converted from
    a markdown document to a Jupyter Notebook. Try running it yourself!
- Added a `Export currently selected features` button that does what it says on the
  tin: it lets you export a TSV file listing the features currently selected in
  a log-ratio. ([#87](https://github.com/biocore/qurro/issues/87))
### Backward-incompatible changes
- Qurro now (explicitly) requires that a Python version of at least 3.5.3 is
  installed. (This is an increase from the previous 3.5 minimum.)
  ([#74](https://github.com/biocore/qurro/issues/74))
- As a temporary measure, the version of Pandas required to install Qurro from
  PyPI has been pinned to below version 1.
  ([#258](https://github.com/biocore/qurro/issues/258))
  - This isn't really "backwards incompatible" since trying to run Qurro with
    Pandas 1.0.0 installed would break.
### Bug fixes
### Performance enhancements
### Miscellaneous
- Various minor documentation updates.
  - Updated Qurro's installation instructions: now you need to install `cython`
    first, alongside NumPy. This addresses a problem some folks started to have
    when installing Qurro into relatively "fresh" environments.

## Qurro 0.5.0 (December 17, 2019)
### Features added
- Added **Qarcoal**, a new command for Qurro's QIIME 2 plugin that computes
  log-ratios from the command line by searching through features' taxonomies.
  This can be useful in a variety of situations -- for example, if you don't
  care about feature ranking information and just want to look at log-ratios,
  or if your BIOM table contains super large numbers that would cause
  JavaScript to start malfunctioning (see the "bug fixes" section below).
    - Thanks to [@gibsramen](http://github.com/gibsramen/) for adding this in
      to Qurro!
- Added **autoselection**, a new method for selecting multiple features in a
  log-ratio. This method just picks features from the top and bottom of the
  currently-selected ranking, using a specified equal amount of features from
  each side (either in percentages of features or in numbers of features).
  ([#189](https://github.com/biocore/qurro/issues/189))
    - This feature should be useful when quickly assessing how much a given
      ranking field "separates" samples along certain metadata categories. It's
      a great starting point when looking at a Qurro visualization.
- Instead of showing selected features in text boxes, these features are now
  displayed in fancy [DataTable](https://datatables.net/)s!
  ([#197](https://github.com/biocore/qurro/issues/197),
  [#232](https://github.com/biocore/qurro/issues/232))
    - Thanks to [@antgonza](https://github.com/antgonza) for adding this in to
      Qurro!
    - This involved adding some dependencies to Qurro's visualization code:
      jQuery, DataTables, Bootstrap's JS code, and Popper.js.
- When selecting a log-ratio where feature(s) are present in both the numerator
  and denominator of the log-ratio, a warning will now be shown explaining the
  situtation (and recommending that you chose a different log-ratio that
  doesn't involve this "overlap").
  ([#249](https://github.com/biocore/qurro/issues/249))
    - We will try to make selectively removing features from one side or
      another of log-ratios easier in the future.
- Added an additional text searching option:
  `is provided, and does not contain the text`. This will select features
  where:
    1. The specified feature field (e.g. Feature ID) is provided, and
    2. The specified feature field does not contain the specified text.

  Note the first clause. If a given field is not provided (e.g. no taxonomy
  information is provided for `Feature A`), then that feature won't show up in
  any results that involve searching on feature taxonomy. This behavior is the
  same as with other text-/number-searching methods, but we've explicitly
  specified it here so that it's clear (since you could argue that a
  non-existent taxonomy entry "does not contain" some text).
  ([#221](https://github.com/biocore/qurro/issues/221))
- The sample plot's x- and y-axes are now no longer forced to include zero. So
  if, say, all of your samples have an x-axis value of at least 20, then they
  won't be squished on the side of the sample plot any more.
  ([#218](https://github.com/biocore/qurro/issues/218))
- All features in the rank plot now have a "Sample Presence Count" field shown
  in their tooltips. A given feature's "Sample Presence Count" value is equal
  to the number of samples in the Qurro visualization that contain that
  feature. This should give some context as to why log-ratios between certain
  features result in more or less samples being dropped from the sample plot.
  ([#217](https://github.com/biocore/qurro/issues/217))
### Backward-incompatible changes
- **Removed the `-gnps`/`--assume-gnps-feature-metadata` argument from the
  standalone Qurro interface.** If you'd like to use GNPS data in Qurro, you'll
  just need to supply a "normal" feature metadata file where the first column
  corresponds to each feature's ID.  (This should be available through GNPS
  now.) A benefit of this is that you can use this data in either the
  standalone or QIIME 2 Qurro interfaces.
  ([#49](https://github.com/biocore/qurro/issues/49))
- As a side effect of implementing the Sample Presence Count feature, if any of
  your feature ranks or feature metadata inputs contain a column named
  `qurro_spc` then an error will be raised when trying to generate a Qurro
  visualization.
- Qurro now requires that a Pandas version of at least 0.24.0 is installed.
- Qurro now (explicitly) requires that a Python version of at least 3.5 is
  installed. (This was already a requirement, but it should be enforced when
  installing Qurro now.)
### Bug fixes
- If your input feature table or feature rankings data contain numbers outside
  of the range of `[-(2**53 - 1), (2**53 - 1)]`, Qurro's Python code will now
  fail with an error explaining the situation. This is because numbers outside
  of this range cannot be precisely represented in JavaScript (at least by
  default). ([#242](https://github.com/biocore/qurro/issues/242))
    - The reason for this is that [JavaScript is inherently limited in the sizes of numbers it can represent by default](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number).
      There are a few ways around this,
      but I do not have the bandwidth to modify and test Qurro to completely
      support rare corner cases like this (at least right now).
    - **Note that this is only a partial solution to this problem**; it's still
      possible to pass in arbitrarily large numbers within your
      sample/feature metadata to Qurro, and the behavior in these situations is
      still currently untested.
    - On the bright side of things :), thanks to the efforts of
      [@gibsramen](https://github.com/gibsramen), Qarcoal is now available, so
      you should be able to compute log-ratios of essentially arbitrarily large
      numbers through that interface.
- Fixed a minor bug in `qurro._df_utils.biom_table_to_sparse_df()` where the
  specified `min_row_ct` and `min_col_ct` were not being used to validate the
  output DataFrame.
    - The validation method was still being called, just with the default
      `min_row_ct` and `min_col_ct` values directly rather than using the
      specified parameters.
    - ...Long story short, this bug should not have impacted you unless you've
      been using `qurro._df_utils.biom_table_to_sparse_df ()` with custom
      validation settings directly. If you've just been using Qurro as a
      standalone tool, you should be unaffected.
### Performance enhancements
### Miscellaneous
- Various aesthetic changes to the Qurro visualization interface (e.g.
  changing the location/styling of certain buttons).
- Renamed the y-axis of the sample plot to say `Current Natural Log-Ratio`
  instead of just `Current Log-Ratio`. (This makes it clearer that these
  log-ratios are computed using the natural log, i.e. `ln`.) This change has
  also been applied to TSV files exported from the sample plot
  (`Current_Log_Ratio` --> `Current_Natural_Log_Ratio`), as well as to the
  tooltips of samples in the sample plot.
- Renamed the y-axis of the rank plot to say either `Differential: ` or
  `Feature Loading: ` instead of `Magnitude: `.
  ([#223](https://github.com/biocore/qurro/issues/223))
- Renamed the label for changing the rank plot ranking from `Ranking` to either
  `Differential` or `Feature Loading`.
- Renamed the `Fit bar widths to the plot's default width?` option (again) to
  `Fit bar widths to a constant plot width?`. This seems like a clearer way of
  describing this option...
- For searching by the values of a given feature ranking, the header shown
  above all of the ranking column names said `Feature Rankings`.
  This was slightly misleading, since searching is being done on the
  magnitudes of each ranking column for each feature (i.e. based on the
  y-axis values shown in the rank plot). To make things clearer, this header
  has been changed from `Feature Rankings` to either `Differentials` or
  `Feature Loadings`.
- Improved the command-line documentation of the sample and feature metadata
  parameters.
- Added the poster from a recent presentation we did on Qurro to this
  repository, and linked the poster's PDF from the README.
- Various documentation updates in the README.
- Changed the project structure around slightly to ensure that
  `dependency_licenses/` for libraries distributed with Qurro
  (Vega, Vega-Lite, Vega-Embed, RequireJS, Bootstrap) are now installed in
  both "source" and "built" distributions of Qurro (previously, these were only
  installed in "source" distributions).
- Added `nbconvert` to Qurro's `dev` requirements, and added a command to rerun
  all of the example notebooks in Qurro automatically (`make notebooks`). This
  command is also run on Travis-CI now in order to ensure that future updates
  to Qurro don't crash any of these notebooks.
- Updated the "Mackerel" demo / test data to match the latest output of [this analysis](https://github.com/knightlab-analyses/qurro-mackerel-analysis/). Notable changes include using the `reference-hit` Deblur BIOM output instead of the `all` Deblur BIOM output (which is generally recommended for 16S analyses), and using SILVA instead of Greengenes for taxonomic classification.
- Updated the "Moving Pictures," "Sleep Apnea," and "Mackerel" demo
  descriptions to just say "ASVs" instead of "ASVs / sOTUs" (for clarity's
  sake).

## Qurro 0.4.0 (August 15, 2019)
### Features added
- Started using Bootstrap (v4.3.1) for styling the Qurro visualization
  interface. Although the functionality available in Qurro is still the same,
  this interface has received a significant makeover. The bulk of these
  cosmetic interface changes are not documented here.
  ([#111](https://github.com/biocore/qurro/issues/111))
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
