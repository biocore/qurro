import os
from click.testing import CliRunner
# from rankratioviz import generate
from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_basic():
    eg_dir = os.path.join("example", "deicode_example")
    rloc = os.path.join(eg_dir, "ordination.txt")
    tloc = os.path.join(eg_dir, "qiita_10422_table.biom")
    sloc = os.path.join(eg_dir, "qiita_10422_metadata_encode.tsv")
    floc = os.path.join(eg_dir, "taxonomy.tsv")
    out_dir = os.path.join("rankratioviz", "tests", "output",
                        "standalone_test_basic")
    # Derived from http://click.palletsprojects.com/en/7.x/testing/
    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", rloc, "--table", tloc, "--sample-metadata", sloc,
        "--feature-metadata", floc, "--output-dir", out_dir, "--category",
        "exposure_type_encode"
    ])
    # Check that, at least, the test didn't cause any blatant errors
    assert result.exit_code == 0
    # Validate rank plot JSON
    # TODO: make validate_rank_plot_json() work with arbitrary data, and also
    # with DEICODE ordination files (probs best practice to just add a
    # parameter that changes behavior re: songbird/DEICODE input)
    with open(os.path.join("out_dir", "rank_plot.json"), 'r') as rplot_json:
        rplot = json.load(rplot_json)
        testing_utilities.basic_vegalite_json_validation(rplot)
