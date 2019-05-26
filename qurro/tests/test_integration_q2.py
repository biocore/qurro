from qurro.tests.testing_utilities import run_integration_test


def test_integration_q2_byrd():
    """Tests qurro on songbird output in the context of QIIME 2."""

    run_integration_test(
        "byrd",
        "q2_byrd",
        "byrd_differentials.tsv",
        "byrd_skin_table.biom",
        "byrd_metadata.txt",
        use_q2=True,
        q2_ranking_tool="songbird",
    )


def test_integration_q2_sleep_apnea():
    """Tests qurro on DEICODE output in the context of QIIME 2."""

    run_integration_test(
        "sleep_apnea",
        "q2_sleep_apnea",
        "ordination.txt",
        "qiita_10422_table.biom",
        "qiita_10422_metadata.tsv",
        feature_metadata_name="taxonomy.tsv",
        use_q2=True,
        q2_ranking_tool="DEICODE",
    )


def test_integration_q2_red_sea():
    """Tests qurro on songbird output with non-strictly-16S data in the
       context of QIIME 2.

       (Technically the Byrd data is also from a metagenomic study, but the
       features here are named pretty differently.)
    """
    run_integration_test(
        "red_sea",
        "q2_red_sea",
        "differentials.tsv",
        "redsea.biom",
        "redsea_metadata.txt",
        feature_metadata_name="feature_metadata.txt",
        use_q2=True,
        q2_ranking_tool="songbird",
    )


def test_moving_pictures():
    """Tests qurro' JSON generation on the "Moving Pictures of the Human
       Microbiome" dataset.
    """
    run_integration_test(
        "moving_pictures",
        "q2_moving_pictures",
        "ordination.txt",
        "feature-table.biom",
        "sample-metadata.tsv",
        feature_metadata_name="taxonomy.tsv",
    )
