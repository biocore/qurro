from qurro.tests.testing_utilities import (
    run_integration_test,
    get_data_from_plot_json,
)


params = [
    "matching_test",
    "empty_samples_no_efc",
    "differentials.tsv",
    "empty_samples.biom",
    "sample_metadata.txt",
]


def test_empty_sample_integration_basic():
    rpj, spj, cj = run_integration_test(
        *params, feature_metadata_name="feature_metadata.txt"
    )
    # look at sample plot json -- verify that just Sample2 dropped (due to
    # being empty: having a count of 0 for every feature)
    sample_data = get_data_from_plot_json(spj)
    for s in ("Sample1", "Sample3", "Sample5", "Sample6", "Sample7"):
        assert s in sample_data
    assert "Sample4" not in sample_data
    assert "Sample2" not in sample_data


def test_empty_sample_integration_extreme_feature_count():
    params_copy = params[:]
    params_copy[1] = "empty_samples_yes_efc"
    rpj2, spj2, cj2 = run_integration_test(
        *params_copy,
        feature_metadata_name="feature_metadata.txt",
        extreme_feature_count=1,
    )
    # look at sample plot json -- verify that Sample2 + 3 dropped
    # (Sample2 due to being empty, and Sample3 due to being empty after the one
    # feature it had a count for, Taxon3, was removed due to -x.)
    # (Also, verify that most of the features were dropped due to -x.)
    sample_data_2 = get_data_from_plot_json(spj2)
    for s2 in ("Sample1", "Sample5", "Sample6", "Sample7"):
        assert s2 in sample_data_2
    assert "Sample4" not in sample_data_2
    assert "Sample2" not in sample_data_2
    assert "Sample3" not in sample_data_2
