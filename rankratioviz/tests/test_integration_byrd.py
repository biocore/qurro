import os
from click.testing import CliRunner
from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_byrd():
    """Tests the JSON generation on the Byrd et al. 2017 dataset."""

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
