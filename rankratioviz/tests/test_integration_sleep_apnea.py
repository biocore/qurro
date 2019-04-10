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

    testing_utilities.validate_standalone_result(result)
    testing_utilities.validate_plots_js(out_dir, rloc, tloc, sloc)
