# import os
# from rankratioviz import generate
# from rankratioviz.tests import testing_utilities


def test_matchdf():
    """Tests rankratioviz.generate.matchdf()."""


def test_byrd():
    """Tests the JSON generation on the Byrd et al. 2017 dataset.

    NOTE that this tset was designed for the old version of rankratioviz that
    parsed beta.csv files instead of ordination files, so we just skip over
    this test for now. I'll change this in the future.
    """
    pass
    # return

    # test_input_dir = os.path.join("data", "byrd")
    # test_output_dir = os.path.join("rankratioviz", "tests", "output", "byrd")

    # rank_json_loc = os.path.join(test_output_dir, "rank_plot.json")
    # sample_json_loc = os.path.join(test_output_dir,
    #                                "sample_logratio_plot.json")

    # input_rank_loc = os.path.join(test_input_dir, "beta.csv")
    # biom_table_loc = os.path.join(test_input_dir, "byrd_skin_table.biom")
    # metadata_loc = os.path.join(test_input_dir, "byrd_metadata.txt")

    # # Actually run the plot generation script
    # gen_plots.run_script(["-r", input_rank_loc, "-t", biom_table_loc,
    #     "-m", metadata_loc, "-d", test_output_dir])

    # # We use the ranks contained in column 3 (0-indexed) because they
    # # correspond to the log(PostFlare/Flare) + K ranks: the column name for
    # # this in beta.csv is "C(Timepoint, Treatment('F'))[T.PF]".
    # # When adapting this test to other datasets/rank files, you'll need to
    # # adjust this parameter accordingly.
    # # TODO: pass in category ID to validate_rank_plot_json()? Or just work on
    # # getting arbitrary metadata support available, *then* dev tests.
    # # (...or dev tests before doing the arbitrary metadata stuff)
    # testing_utilities.validate_rank_plot_json(input_rank_loc, rank_json_loc)
    # testing_utilities.validate_sample_plot_json(biom_table_loc, metadata_loc,
    #         sample_json_loc)
