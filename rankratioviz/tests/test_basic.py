import os
from click.testing import CliRunner
from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_basic():
    eg_dir = os.path.join("example", "deicode_example")
    eg_out_dir = os.path.join(eg_dir, "output")

    rloc = os.path.join(eg_out_dir, "ordination.txt")
    tloc = os.path.join(eg_dir, "qiita_10422_table.biom")
    sloc = os.path.join(eg_dir, "qiita_10422_metadata.tsv")
    floc = os.path.join(eg_dir, "taxonomy.tsv")
    out_dir = os.path.join("rankratioviz", "tests", "output",
                           "standalone_test_basic")
    # Derived from http://click.palletsprojects.com/en/7.x/testing/
    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", rloc, "--table", tloc, "--sample-metadata", sloc,
        "--feature-metadata", floc, "--output-dir", out_dir
    ])
    # Check that, at least, the test didn't cause any blatant errors
    assert result.exit_code == 0
    # Validate rank plot JSON
    rank_plot_loc = os.path.join(out_dir, "rank_plot.json")
    testing_utilities.validate_rank_plot_json(rloc, rank_plot_loc)
