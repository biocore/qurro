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
    out_dir = os.path.join("rankratioviz", "tests", "output", "sleep_apnea")

    # Derived from http://click.palletsprojects.com/en/7.x/testing/
    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", rloc, "--table", tloc, "--sample-metadata", sloc,
        "--feature-metadata", floc, "--output-dir", out_dir
    ])

    plots_loc = os.path.join(out_dir, "plots.js")
    rank_json, sample_json = testing_utilities.get_plot_jsons(plots_loc)

    # Check that, at least, the test didn't cause any blatant errors
    assert result.exit_code == 0
    testing_utilities.validate_samples_supported_output(result.output, 0)

    # Validate JSON
    testing_utilities.validate_rank_plot_json(rloc, rank_json)
    testing_utilities.validate_sample_plot_json(tloc, sloc, sample_json)
