from rankratioviz.tests.testing_utilities import run_integration_test


def test_integration_q2_sleep_apnea():
    """Tests rankratioviz on DEICODE output in the context of QIIME 2."""

    run_integration_test("sleep_apnea", "q2_sleep_apnea", "ordination.txt",
                         "qiita_10422_table.biom", "qiita_10422_metadata.tsv",
                         feature_metadata_name="taxonomy.tsv", use_q2=True,
                         q2_ranking_tool="DEICODE")


def test_integration_q2_byrd():
    """Tests rankratioviz on songbird output in the context of QIIME 2."""

    run_integration_test("byrd", "q2_byrd", "byrd_differentials.tsv",
                         "byrd_skin_table.biom", "byrd_metadata.txt",
                         use_q2=True, q2_ranking_tool="songbird")
