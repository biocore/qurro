import json
from pytest import approx
from rankratioviz._rank_processing import rank_file_to_df


def basic_vegalite_json_validation(json_obj):
    """Basic validations of Vega-Lite JSON objects go here."""

    assert json_obj["$schema"].startswith("https://vega.github.io/schema")
    assert json_obj["$schema"].endswith(".json")


def validate_rank_plot_json(input_ranks_loc, rank_json_loc):
    """Ensure that the rank plot JSON makes sense."""

    ranked_features = rank_file_to_df(input_ranks_loc)
    # Validate the rank plot JSON.
    with open(rank_json_loc, "r") as rank_plot_file:
        rank_plot = json.load(rank_plot_file)
        # Validate some basic properties of the plot
        # (This is all handled by Altair, so these property tests aren't
        # exhaustive; they're mainly intended to verify that a general plot
        # matching our specs is being created)
        assert rank_plot["mark"] == "bar"
        assert rank_plot["title"] == "Ranks"
        basic_vegalite_json_validation(rank_plot)
        dn = rank_plot["data"]["name"]
        # Check that we have the same count of ranked features as in the
        # input ranks file: this assumes that every ranked feature has an entry
        # in the BIOM table, which is a reasonable assumption
        assert len(rank_plot["datasets"][dn]) == len(ranked_features)
        # Loop over every rank included in this JSON file:
        rank_ordering = rank_plot["datasets"]["rankratioviz_rank_ordering"]
        prev_rank_0_val = float("-inf")
        prev_x_val = -1
        # (we go through the reference features DataFrame simultaneously)
        ranked_features_iterator = ranked_features.iterrows()
        for feature in rank_plot["datasets"][dn]:
            # Check that we're using the correct "coefs" value
            # We use pytest's approx class to get past floating point
            # imprecisions. Note that we just leave this at the default for
            # approx, so if this starts failing then adjusting the tolerances
            # in approx() might be needed.
            if "ordination.txt" in input_ranks_loc:
                # NOTE Based on how we construct feature labels from DEICODE
                # input. If that changes, this will need to change or this
                # will break.
                feature_id = feature["Feature ID"].split("|")[2]
            else:
                feature_id = feature["Feature ID"]

            # Check that each ranked feature matches:
            curr_iter_feature = next(ranked_features_iterator)
            # IDs should match
            assert feature_id == curr_iter_feature[0]
            # Each rank value should match
            for r in range(len(rank_ordering)):
                # curr_iter_feature[1][r] is the r-th rank of the feature
                # defined by the current row in the DataFrame.
                actual_rank_val = curr_iter_feature[1][r]
                assert actual_rank_val == approx(feature[rank_ordering[r]])

            # Check that the initial ranks are in order (i.e. the first rank of
            # each feature should be monotonically increasing)
            # (If this rank is approximately equal to the previous rank, then
            # don't bother with the comparison -- but still update
            # prev_rank_0_val.)
            if feature[rank_ordering[0]] != approx(prev_rank_0_val):
                assert feature[rank_ordering[0]] >= prev_rank_0_val
            # Check that x values are also in order
            assert feature["x"] == prev_x_val + 1
            # Update prev_ things for the next iteration of the loop
            prev_rank_0_val = feature[rank_ordering[0]]
            prev_x_val = feature["x"]


def validate_sample_plot_json(biom_table_loc, metadata_loc, sample_json_loc):
    with open(sample_json_loc, "r") as sampleplotfile:
        sample_plot = json.load(sampleplotfile)
        assert sample_plot["mark"] == "circle"
        assert sample_plot["title"] == "Log Ratio of Abundances in Samples"
        basic_vegalite_json_validation(sample_plot)
        # dn = sample_plot["data"]["name"]
        # TODO check that all metadata samples are accounted for in BIOM table
        # TODO check that every log ratio is correct! I guess that'll make us
        # load the rank plots file, but it's worth it (tm)
