import os
from click.testing import CliRunner
from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_sleep_apnea_basic():

    in_dir = os.path.join("rankratioviz", "tests", "input", "sleep_apnea")

    rloc = os.path.join(in_dir, "ordination.txt")
    tloc = os.path.join(in_dir, "qiita_10422_table.biom")
    sloc = os.path.join(in_dir, "qiita_10422_metadata.tsv")
    floc = os.path.join(in_dir, "taxonomy.tsv")
    out_dir = os.path.join("rankratioviz", "tests", "output",
                           "sleep_apnea")
    # Derived from http://click.palletsprojects.com/en/7.x/testing/
    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", rloc, "--table", tloc, "--sample-metadata", sloc,
        "--feature-metadata", floc, "--output-dir", out_dir
    ])
    # Check that, at least, the test didn't cause any blatant errors
    assert result.exit_code == 0
    testing_utilities.validate_samples_supported_output(result.output, 0)
    # Validate JSON
    rank_plot_loc = os.path.join(out_dir, "rank_plot.json")
    sample_plot_loc = os.path.join(out_dir, "sample_plot.json")
    testing_utilities.validate_rank_plot_json(rloc, rank_plot_loc)
    testing_utilities.validate_sample_plot_json(tloc, sloc, sample_plot_loc)
