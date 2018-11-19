# RankRatioViz

(Name subject to change.)

This tool visualizes the output from a tool like
[Songbird](https://github.com/mortonjt/songbird). It facilitates viewing
a "ranked" plot of taxa alongside a scatterplot showing the log ratios of
certain taxon abundances within samples.

These visualizations are linked: selections in the rank plot impact the
scatterplot of samples by changing the log ratios that are used. You can also
run textual queries over the various taxa's lineages, in order to create more
complicated log ratios -- the taxa used in these log ratios are highlighted in
the rank plot.

## Inputs

This tool takes as input two [Vega-Lite](https://vega.github.io/vega-lite/)
JSON files (one for the rank plot and one for the sample scatterplot). Right
now this is mostly configured to work
with one particular example (using data from Byrd et al. 2018 on microbes
associated with atopic dermatitis), but we're planning to make it work
with arbitrary data. We currently generate these JSON files using
[Altair](https://altair-viz.github.io/); the code for that isn't in this
repository yet, but should be soon.

You can also upload a file of "select microbes" to filter the taxa used in
textual queries. A sample file (`byrd_select_microbes.txt`) for this is
included in this repository.

## Other tools used

- Vega
- Vega-Lite
- Vega-Embed
- Altair
- MathJax
- jQuery
