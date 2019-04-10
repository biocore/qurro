import os
from qiime2 import Artifact, Metadata
from qiime2.plugins import rankratioviz as q2rankratioviz
from rankratioviz.tests import testing_utilities


def test_integration_q2_sleep_apnea():
    """Tests rankratioviz on DEICODE output in the context of QIIME 2.

       This test makes use of the QIIME 2 Artifact API. See
       https://docs.qiime2.org/2019.1/interfaces/artifact-api/ (you will
       probably need to replace the "2019.1" in that URL depending on what
       QIIME 2 version is most recent) for details.
    """

    in_dir = os.path.join("rankratioviz", "tests", "input", "sleep_apnea")
    rloc = os.path.join(in_dir, "ordination.txt")
    tloc = os.path.join(in_dir, "qiita_10422_table.biom")
    sloc = os.path.join(in_dir, "qiita_10422_metadata.tsv")
    floc = os.path.join(in_dir, "taxonomy.tsv")
    out_dir = os.path.join("rankratioviz", "tests", "output", "q2_sleep_apnea")

    # First off, import all of these files as Q2 artifacts or metadata.
    rank_qza = Artifact.import_data(
        "PCoAResults % Properties(['biplot'])",
        rloc
    )
    table_qza = Artifact.import_data("FeatureTable[Frequency]", tloc)
    sample_metadata = Metadata.load(sloc)
    feature_metadata = Metadata.load(floc)

    # Now that everything's imported, try running rankratioviz
    rrv_qzv = q2rankratioviz.actions.unsupervised_rank_plot(
        ranks=rank_qza,
        table=table_qza,
        sample_metadata=sample_metadata,
        feature_metadata=feature_metadata
    )

    # Output the contents of the visualization to out_dir.
    rrv_qzv.visualization.export_data(out_dir)

    # Verify correctness of output.
    testing_utilities.validate_plots_js(out_dir, rloc, tloc, sloc)


def test_integration_q2_byrd():
    """Tests rankratioviz on songbird output in the context of QIIME 2.

       Same notes as in the above test function apply.
    """

    in_dir = os.path.join("rankratioviz", "tests", "input", "byrd")
    rloc = os.path.join(in_dir, "byrd_differentials.tsv")
    tloc = os.path.join(in_dir, "byrd_skin_table.biom")
    sloc = os.path.join(in_dir, "byrd_metadata.txt")
    out_dir = os.path.join("rankratioviz", "tests", "output", "q2_byrd")

    # First off, import all of these files as Q2 artifacts or metadata.
    rank_qza = Artifact.import_data("FeatureData[Differential]", rloc)
    table_qza = Artifact.import_data("FeatureTable[Frequency]", tloc)
    sample_metadata = Metadata.load(sloc)

    # Now that everything's imported, try running rankratioviz
    rrv_qzv = q2rankratioviz.actions.supervised_rank_plot(
        ranks=rank_qza,
        table=table_qza,
        sample_metadata=sample_metadata
    )

    # Output the contents of the visualization to out_dir.
    rrv_qzv.visualization.export_data(out_dir)

    # Verify correctness of output.
    testing_utilities.validate_plots_js(out_dir, rloc, tloc, sloc)
