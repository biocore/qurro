import json
from pytest import approx

def validate_rank_plot_json(input_rank_loc, rank_json_loc, rank_col_index):
    # Record all taxa and the requested rank value in the input ranks file
    ranked_taxa = {}
    first_line = True
    with open(input_rank_loc, "r") as inrankfile:
        for line in inrankfile:
            if first_line:
                first_line = False
                continue
            line_parts = line.strip().split(",")
            # Assumes that the first column in the file contains the taxon name
            ranked_taxa[line_parts[0]] = float(line_parts[rank_col_index])

    # Validate the rank plot JSON.
    with open(rank_json_loc, "r") as rankfile:
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
