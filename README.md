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

The web visualization tool takes as input two
[Vega-Lite](https://vega.github.io/vega-lite/)
JSON files (one for the rank plot and one for the sample scatterplot).
We currently generate these JSON files in a Python
script, the code for which is located in `gen_plots.py`. Right now this script
is configured to look for and use data from
[Byrd et al. 2017](http://stm.sciencemag.org/content/9/397/eaal4651),
but we're working on
making this support arbitrary data sources (based on command-line options).

You can upload a file of "select microbes" to the web visualization tool to
filter the taxa used in
textual queries. A sample file (`byrd_inputs/byrd_select_microbes.txt`) for this is
included in this repository.

## Other tools used

Loaded via CDN in the web visualization interface:
- [Vega](https://vega.github.io/vega/)
- [Vega-Lite](https://vega.github.io/vega-lite/)
- [Vega-Embed](https://github.com/vega/vega-embed)
- [MathJax](https://www.mathjax.org/)
- [jQuery](https://jquery.com/)

Used to generate input JSON files for the visualization interface in
`gen_plots.py`:
- [NumPy](http://www.numpy.org/)
- [pandas](https://pandas.pydata.org/)
- [biom](http://biom-format.org/)
- [Altair](https://altair-viz.github.io/)

## License

This tool is licensed under the [BSD 3-clause license](https://en.wikipedia.org/wiki/BSD_licenses#3-clause_license_(%22BSD_License_2.0%22,_%22Revised_BSD_License%22,_%22New_BSD_License%22,_or_%22Modified_BSD_License%22)).
Our particular version of the license is based on [scikit-bio](https://github.com/biocore/scikit-bio)'s [license](https://github.com/biocore/scikit-bio/blob/master/COPYING.txt).
