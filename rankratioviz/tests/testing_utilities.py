import json
from pytest import approx
from rankratioviz._rank_processing import rank_file_to_df


def basic_vegalite_json_validation(json_obj):
    """Basic validations of Vega-Lite JSON objects go here."""

    assert json_obj["$schema"].startswith("https://vega.github.io/schema")
    assert json_obj["$schema"].endswith(".json")


def validate_rank_plot_json(input_ranks_loc, rank_json_loc):
    """Ensure that the rank plot JSON makes sense."""

    reference_features = rank_file_to_df(input_ranks_loc)
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
        # input ranks file (no ranked features should be dropped during the
        # generation process -- there's an assertion in the code that checks
        # for this, actually)
        assert len(rank_plot["datasets"][dn]) == len(reference_features)
        # Loop over every rank included in this JSON file:
        rank_ordering = rank_plot["datasets"]["rankratioviz_rank_ordering"]
        prev_rank_0_val = float("-inf")
        prev_x_val = -1
        for feature in rank_plot["datasets"][dn]:
            # TODO when we merge in songbird-support, the 2 here should be
            # replaced with a 0 (since we consistently have the
            # augmented-with-feature-metadata feature IDs start with their
            # initial ID). otherwise this will fail lol
            feature_id = feature["Feature ID"].split("|")[2]
            # Identify corresponding "reference" feature in the original data.
            #
            # We already should have asserted in the generation code that the
            # feature IDs were unique, so we don't need to worry about
            # accidentally using the same reference feature twice here.
            #
            # Also, we use .loc[feature ID] here in order to access a row of
            # the DataFrame. Because just straight indexing the DataFrame gives
            # you the column.
            reference_feature_series = reference_features.loc[feature_id]

            # Each rank value between the JSON and reference feature should
            # match.
            # We use pytest's approx class to get past floating point
            # imprecisions. Note that we just leave this at the default for
            # approx, so if this starts failing then adjusting the tolerances
            # in approx() might be needed.
            for r in range(len(rank_ordering)):
                actual_rank_val = reference_feature_series[r]
                assert actual_rank_val == approx(feature[rank_ordering[r]])

            # Check that the initial ranks of the JSON features are in order
            # (i.e. the first rank of each feature should be monotonically
            # increasing)
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
