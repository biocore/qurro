# rankratioviz
[![Build Status](https://travis-ci.org/fedarko/rankratioviz.svg?branch=master)](https://travis-ci.org/fedarko/rankratioviz)

(Name subject to change.)

This tool visualizes the output from a tool like
[songbird](https://github.com/mortonjt/songbird). It facilitates viewing
a "ranked" plot of taxa alongside a scatterplot showing the log ratios of
selected taxon abundances within samples.

This tool is still being developed, so backwards-compatibile changes might
occur. If you have any questions, feel free to contact me at mfedarko@ucsd.edu.

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
taxa with rank X over the combined abundances of all taxa with rank Y").
Although this method doesn't require you to manually select taxa on the rank
plot, the rank plot is still updated to indicate the taxa used in the log
ratios.

## Screenshot

![Screenshot of the log ratio of the combined abundances of all taxa with the rank 'Staphylococcus' over the combined abundances of all taxa with the rank 'Propionibacterium.'](https://raw.githubusercontent.com/fedarko/rankratioviz/master/screenshots/genera.png)
_Screenshot of the log ratio of the combined abundances of all taxa with the rank "Staphylococcus" over the combined abundances of all taxa with the rank "Propionibacterium." This visualization was created using sample data from Byrd et al. 2017 [2]; this data is included in the `data/byrd` folder of this repository._

## Inputs

The web visualization tool takes as input two
[Vega-Lite](https://vega.github.io/vega-lite/)
JSON files (one for the rank plot and one for the sample scatterplot). It tries
to load these from its directory (`viewer/`) upon the page loading.

We currently generate these JSON files in a Python
script, the code for which is located in `gen_plots.py`.

You can also upload a file of "select microbes" to the web visualization tool to
filter the taxa used in
textual queries. A sample file (`data/byrd/byrd_select_microbes.txt`) for this is
included in this repository.

## Installation

1. Clone this repository to your system:

   ```bash
   git clone https://github.com/fedarko/rankratioviz.git
   ```

2. Install dependencies via conda:

   ```bash
   conda env create
   ```

## Running the tool

### Generating new JSON files using `gen_plots.py`

Currently, you can run this script via `python3 rankratioviz/gen_plots.py`.
(Make sure to activate the conda environment via `source activate rrv` first!)

```
usage: gen_plots.py [-h] -r RANK_FILE -t TABLE_FILE -m METADATA_FILE
                    [-d OUTPUT_DIRECTORY]

Prepares two Altair JSON plots -- one for a rank plot of taxa, and one for a
scatterplot of sample taxon abundances -- as input for rankratioviz' web
interface.

optional arguments:
  -h, --help            show this help message and exit
  -r RANK_FILE, --rank-file RANK_FILE
                        CSV file detailing rank values for taxa. This should
                        be the output of a tool like songbird or DEICODE.
  -t TABLE_FILE, --table-file TABLE_FILE
                        BIOM table describing taxon abundances for samples.
  -m METADATA_FILE, --metadata-file METADATA_FILE
                        Metadata table file for samples.
  -d OUTPUT_DIRECTORY, --output-directory OUTPUT_DIRECTORY
                        Output directory for JSON files (defaults to CWD)
```

To stage these JSON files for the visualization,
set the `-d` option to `viewer/` (or just move them to `viewer/` after running
the Python script). Note that this will overwrite the JSON files currently in
the `viewer/` directory.

(If you already have the visualization running and want it to update to reflect
new JSON files in the `viewer/` directory, you'll need to refresh your browser.
You might need to do something like Ctrl-Shift-R to force the browser to reload
the new JSON files.)

### Viewing a visualization of the plots defined by the JSON files

(Make sure the `rrv` conda environment has been activated first!)

1. Run a simple server using Python from within this repository's folder:
   ```bash
   make run
   ```

2. Open your browser to `localhost:8000/viewer`. The JSON files in this
   directory should automatically be loaded. (If you want, you can
   change the port number by passing an argument like `PORT=8080` to
   `make run`.)

## Tools used

Loaded via CDN in the web visualization interface:
- [Vega](https://vega.github.io/vega/)
- [Vega-Lite](https://vega.github.io/vega-lite/)
- [Vega-Embed](https://github.com/vega/vega-embed)
- [MathJax](https://www.mathjax.org/)
- [jQuery](https://jquery.com/)

Used to generate input JSON files for the visualization interface in
`gen_plots.py`:
- [Python 3](https://www.python.org/) (a version of at least 3.2 is required)
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
