import os
import json
from click.testing import CliRunner
from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_matching():
    """Tests the behavior of rrv in matching sample metadata, feature metadata,
       ranks, and the BIOM table together.
    """

    input_dir = os.path.join("rankratioviz", "tests", "input", "matching_test")
    out_dir = os.path.join("rankratioviz", "tests", "output", "matching_test")

    rank_json_loc = os.path.join(out_dir, "rank_plot.json")
    sample_json_loc = os.path.join(out_dir, "sample_plot.json")

    rloc = os.path.join(input_dir, "differentials.tsv")
    tloc = os.path.join(input_dir, "mt.biom")
    sloc = os.path.join(input_dir, "sample_metadata.txt")
    floc = os.path.join(input_dir, "feature_metadata.txt")

    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", rloc, "--table", tloc, "--sample-metadata", sloc,
        "--feature-metadata", floc, "--output-dir", out_dir
    ])
    # Check that, at least, the test didn't cause any blatant errors
    assert result.exit_code == 0
    testing_utilities.validate_samples_supported_output(result.output, 1)
    testing_utilities.validate_rank_plot_json(rloc, rank_json_loc)
    testing_utilities.validate_sample_plot_json(tloc, sloc, sample_json_loc)

    # Assert that Taxon3 has been annotated.
    with open(rank_json_loc, 'r') as rank_plot_file:
        rank_plot = json.load(rank_plot_file)
        data_name = rank_plot["data"]["name"]
        # Hardcoded based on the one populated row in floc. This shouldn't
        # change in the future, so hardcoding it here is fine.
        relevant_feature_metadata = ["Taxon3", "Yeet", "100"]
        # We know Taxon3 will be in the 1th position because the feature should
        # be sorted by their first rank (in this case, Intercept)
        t3id = rank_plot["datasets"][data_name][1]["Feature ID"]
        # We don't care how the feature metadata annotation is done; we just
        # want to make sure that all the metadata is in the feature ID somehow
        for fm in relevant_feature_metadata:
            assert fm in t3id
        # Check that the other taxa haven't been annotated with this data
        # (Obviously, if the feature metadata is somehow present in a taxon
        # name -- e.g. we have a taxon called "Taxon100" -- then this would
        # fail, but for this simple test with five taxa it shouldn't matter.)
        for x in [0, 2, 3, 4]:
            txid = rank_plot["datasets"][data_name][x]["Feature ID"]
            for fm in relevant_feature_metadata:
                assert fm not in txid

    with open(sample_json_loc, 'r') as sample_plot_file:
        sample_plot = json.load(sample_plot_file)

        # Assert that Sample4 was dropped from the "main" dataset of the plot
        data_name = sample_plot["data"]["name"]
        for sample in sample_plot["datasets"][data_name]:
            assert sample["Sample ID"] != "Sample4"

        # Assert that Sample4 was also dropped from the counts data in the JSON
        cts_data = sample_plot["datasets"]["rankratioviz_feature_counts"]
        for txcolid in cts_data:
            assert "Sample4" not in cts_data[txcolid]

        # Assert that Taxon3's annotation carried over to the sample plot.
        for txid in sample_plot["datasets"]["rankratioviz_feature_col_ids"]:
            if txid.startswith("Taxon3"):
                for fm in relevant_feature_metadata:
                    assert fm in txid

    # TODO call testing_utilities.validate_sample_plot_json() here
