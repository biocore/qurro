import os
from click.testing import CliRunner
from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_byrd():
    """Tests rankratioviz' JSON generation on the Byrd et al. 2017 dataset.
    
       This is really a test to make sure that rankratioviz can properly handle
       songbird output.
    """

    byrd_input_dir = os.path.join("rankratioviz", "tests", "input", "byrd")
    out_dir = os.path.join("rankratioviz", "tests", "output", "byrd")

    rloc = os.path.join(byrd_input_dir, "byrd_differentials.tsv")
    tloc = os.path.join(byrd_input_dir, "byrd_skin_table.biom")
    sloc = os.path.join(byrd_input_dir, "byrd_metadata.txt")

    # Actually run the plot generation script
    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", rloc, "--table", tloc, "--sample-metadata", sloc,
        "--output-dir", out_dir
    ])

    testing_utilities.validate_standalone_result(result)
    testing_utilities.validate_plots_js(out_dir, rloc, tloc, sloc)


def test_sleep_apnea():
    """Tests rankratioviz' JSON generation on a "sleep apnea" dataset.
    
       This is really a test to make sure that rankratioviz can properly handle
       DEICODE output.
    """

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
