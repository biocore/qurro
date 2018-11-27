# RankRatioViz

(Name subject to change.)

This tool visualizes the output from a tool like
[Songbird](https://github.com/mortonjt/songbird). It facilitates viewing
a "ranked" plot of taxa alongside a scatterplot showing the log ratios of
selected taxon abundances within samples.

## Linked visualizations
These two visualizations (the rank plot and sample scatterplot) are linked [1]:
selections in the rank plot modify the scatterplot of samples, and
modifications of the sample scatterplot that weren't made through the rank plot
trigger an according update in the rank plot.

To elaborate on that: clicking on two taxa in the rank plot sets a new
numerator taxon (determined from the first-clicked taxon) and a new denominator
taxon (determined from the second-clicked taxon) for the abundance log ratios
in the scatterplot of samples.

You can also run textual queries over the various taxa definitions, in order to
create more complicated log ratios
(e.g. "the log ratio of the combined abundances of all
taxa with rank X over the combined abundances of all taxa with rank Y").\*
Although this method doesn't require you to manually select taxa on the rank
plot, the rank plot is still updated to highlight the taxa used in the log
ratios.

\* The ranks within a taxon are separated by semicolons, so if you want to filter
just to taxa containing a certain rank -- e.g. "Propionibacterium" -- you can
specify this as `;Propionibacterium;`. (Of course, if the rank you're using is
on the species level you'll need to omit the trailing semicolon, and if the
rank you're using is at the domain level you'll need to omit the leading
semicolon. This feature is in development, so we'll probably remove the need
for this behavior in the future.)

## Screenshot

![Screenshot of the log ratio of the combined abundances of all taxa with the rank 'Staphylococcus' over the combined abundances of all taxa with the rank 'Propionibacterium.'](https://raw.githubusercontent.com/fedarko/RankRatioViz/master/screenshots/genera.png)
_Screenshot of the log ratio of the combined abundances of all taxa with the rank "Staphylococcus" over the combined abundances of all taxa with the rank "Propionibacterium." This visualization was created using sample data from Byrd et al. 2017 [2]; this data is included in the `byrd_inputs` folder of this repository._

## Inputs

The web visualization tool takes as input two
[Vega-Lite](https://vega.github.io/vega-lite/)
JSON files (one for the rank plot and one for the sample scatterplot). It tries
to load these from its directory (that is, the root of this repository) upon
the page loading.

We currently generate these JSON files in a Python
script, the code for which is located in `gen_plots.py`. Right now this script
is configured to look for and use data from Byrd et al. 2017 [2], but we're
working on making this support arbitrary data sources (based on command-line
options).

You can also upload a file of "select microbes" to the web visualization tool to
filter the taxa used in
textual queries. A sample file (`byrd_inputs/byrd_select_microbes.txt`) for this is
included in this repository.

## Installation

1. Clone this repository to your system:

```bash
git clone https://github.com/fedarko/RankRatioViz.git
```

2. Install dependencies via conda:

```bash
conda env create
```

## Running the tool

### Generating new JSON files using `gen_plots.py`

(Right now this just uses the Byrd et al. 2017 data -- more options to come
shortly!)

Note that this command will replace the prior JSON files contained in this
directory.

```bash
python3 gen_plots.py
```

### Viewing a visualization of the plots defined by the JSON files

1. Run a simple server using Python from within this repository's folder:
   ```bash
   python3 -m http.server
   ```

2. Open your browser to `localhost:8000/microbe_selection.html`. The JSON files
   should automatically be loaded. (The port might differ depending on what
   Python did in step 1 -- look at the output of this command to determine the
   URL to navigate to.)

## Tools used

Loaded via CDN in the web visualization interface:
- [Vega](https://vega.github.io/vega/)
- [Vega-Lite](https://vega.github.io/vega-lite/)
- [Vega-Embed](https://github.com/vega/vega-embed)
- [MathJax](https://www.mathjax.org/)
- [jQuery](https://jquery.com/)

Used to generate input JSON files for the visualization interface in
`gen_plots.py`:
- [Python 3](https://www.python.org/)
- [NumPy](http://www.numpy.org/)
- [pandas](https://pandas.pydata.org/)
- [biom-format](http://biom-format.org/)
- [Altair](https://altair-viz.github.io/)

## References

[1] Becker, R. A. & Cleveland, W. S. (1987). Brushing scatterplots. _Technometrics, 29_(2), 127-142. (Section 4.1 in particular talks about linking visualizations.)

[2] Byrd, A. L., Deming, C., Cassidy, S. K., Harrison, O. J., Ng, W. I., Conlan, S., ... & NISC Comparative Sequencing Program. (2017). Staphylococcus aureus and Staphylococcus epidermidis strain diversity underlying pediatric atopic dermatitis. _Science translational medicine, 9_(397), eaal4651.

## License

This tool is licensed under the [BSD 3-clause license](https://en.wikipedia.org/wiki/BSD_licenses#3-clause_license_(%22BSD_License_2.0%22,_%22Revised_BSD_License%22,_%22New_BSD_License%22,_or_%22Modified_BSD_License%22)).
Our particular version of the license is based on [scikit-bio](https://github.com/biocore/scikit-bio)'s [license](https://github.com/biocore/scikit-bio/blob/master/COPYING.txt).
