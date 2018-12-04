import os
import json
from pytest import approx
from rankratioviz import gen_plots

def test_byrd():
    """Tests the behavior of gen_plots on the Byrd et al. 2017 dataset."""

    test_input_dir = os.path.join("data", "byrd")
    test_output_dir = os.path.join("rankratioviz", "tests", "output", "byrd")
    # Super basic initial "test." This just makes sure that we don't get any
    # errors. (I'll make this actually test stuff soon.)
    gen_plots.run_script(["-r", os.path.join(test_input_dir, "beta.csv"),
        "-t", os.path.join(test_input_dir, "byrd_skin_table.biom"),
        "-m", os.path.join(test_input_dir, "byrd_metadata.txt"),
        "-d", test_output_dir])
    # Record all taxa and their last rank value in the input ranks file
    # (This rank value corresponds to log(PostFlare/Flare) + K, which we're
    # testing)
    ranked_taxa = {}
    first_line = True
    with open(os.path.join(test_input_dir, "beta.csv"), "r") as inrankfile:
        for line in inrankfile:
            if first_line:
                first_line = False
                continue
            line_parts = line.strip().split(",")
            ranked_taxa[line_parts[0]] = float(line_parts[3])
    # Validate the rank plot JSON.
    # TODO: Make this its own function? We'd need to explicitly order it to
    # come after this first "test," though, so IDK if the extra granularity
    # would be worth the trouble.
    with open(os.path.join(test_output_dir, "rank_plot.json"), "r") as rankfile:
        rank_plot = json.load(rankfile)
        # Validate some basic properties of the plot
        # (This is all handled by Altair, so these property tests aren't
        # exhaustive; they're mainly intended to verify that a general plot
        # matching our specs is being created)
        assert rank_plot["mark"] == "bar"
        assert rank_plot["title"] == "Ranks"
        assert rank_plot["$schema"].startswith("https://vega.github.io/schema")
        assert rank_plot["$schema"].endswith(".json")
        dn = rank_plot["data"]["name"]
        # Check that we have the same count of ranks as in the input ranks file
        assert len(rank_plot["datasets"][dn]) == len(ranked_taxa)
        # Loop over every rank included in this JSON file:
        prev_coefs_val = float("-inf")
        prev_x_val = -1
        for rank in rank_plot["datasets"][dn]:
            # Check that we're using the correct "coefs" value
            # We use pytest's approx class to get past floating point
            # imprecisions. Note that we just leave this at the default for
            # approx, so if this starts failing then adjusting the tolerances
            # in approx() might be needed.
            assert ranked_taxa[rank["index"]] == approx(rank["coefs"])
            # Check that the ranks are in order (i.e. their "coefs" vals are
            # monotonically increasing)
            # (If this rank is approximately equal to the previous rank, then
            # don't bother with the comparison -- but still update
            # prev_coefs_val, of course.)
            if rank["coefs"] != approx(prev_coefs_val):
                assert rank["coefs"] >= prev_coefs_val
            # Check that x values are also in order
            assert rank["x"] == prev_x_val + 1
            # Update prev_ things for the next iteration of the loop
            prev_coefs_val = rank["coefs"]
            prev_x_val = rank["x"]
