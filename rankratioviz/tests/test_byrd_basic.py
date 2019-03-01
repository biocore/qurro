import os
from click.testing import CliRunner
from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_byrd():
    """Tests the JSON generation on the Byrd et al. 2017 dataset."""

    byrd_input_dir = os.path.join("rankratioviz", "tests", "input", "byrd")
    out_dir = os.path.join("rankratioviz", "tests", "output", "byrd")

    rank_json_loc = os.path.join(out_dir, "rank_plot.json")
    # sample_json_loc = os.path.join(out_dir, "sample_logratio_plot.json")

    rloc = os.path.join(byrd_input_dir, "byrd_differentials.tsv")
    tloc = os.path.join(byrd_input_dir, "byrd_skin_table.biom")
    sloc = os.path.join(byrd_input_dir, "byrd_metadata.txt")

    # Actually run the plot generation script
    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", rloc, "--table", tloc, "--sample-metadata", sloc,
        "--output-dir", out_dir
    ])
    # Check that, at least, the test didn't cause any blatant errors
    assert result.exit_code == 0
    # Validate rank plot JSON
    testing_utilities.validate_rank_plot_json(rloc, rank_json_loc)
    # TODO call testing_utilities.validate_sample_plot_json() here
