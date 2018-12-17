import os
from rankratioviz import gen_plots
from rankratioviz.tests import testing_utilities

def test_byrd():
    """Tests the behavior of gen_plots on the Byrd et al. 2017 dataset."""

    test_input_dir = os.path.join("data", "byrd")
    test_output_dir = os.path.join("rankratioviz", "tests", "output", "byrd")

    rank_json_loc = os.path.join(test_output_dir, "rank_plot.json")
    sample_json_loc = os.path.join(test_output_dir, "sample_logratio_plot.json")

    input_rank_loc = os.path.join(test_input_dir, "beta.csv")
    biom_table_loc = os.path.join(test_input_dir, "byrd_skin_table.biom")
    metadata_loc = os.path.join(test_input_dir, "byrd_metadata.txt")

    # Actually run the plot generation script
    gen_plots.run_script(["-r", input_rank_loc, "-t", biom_table_loc,
        "-m", metadata_loc, "-d", test_output_dir])

    # We use the ranks contained in column 3 (0-indexed) because they
    # correspond to the log(PostFlare/Flare) + K ranks: the column name for
    # this in beta.csv is "C(Timepoint, Treatment('F'))[T.PF]".
    # When adapting this test to other datasets/rank files, you'll need to
    # adjust this parameter accordingly.
    testing_utilities.validate_rank_plot_json(input_rank_loc, rank_json_loc, 3)
    testing_utilities.validate_sample_plot_json(biom_table_loc, metadata_loc,
            sample_json_loc)
