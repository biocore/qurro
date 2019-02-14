# import os
from click.testing import CliRunner
# from rankratioviz import generate
# from rankratioviz.tests import testing_utilities
import rankratioviz.scripts._plot as rrvp


def test_basic():
    eg_dir = "example/deicode_example/"
    # Derived from http://click.palletsprojects.com/en/7.x/testing/
    runner = CliRunner()
    result = runner.invoke(rrvp.plot, [
        "--ranks", eg_dir + "ordination.txt", "--table",
        eg_dir + "qiita_10422_table.biom", "--sample-metadata",
        eg_dir + "qiita_10422_metadata_encode.tsv", "--feature-metadata",
        eg_dir + "taxonomy.tsv", "--output-dir",
        "rankratioviz/tests/output/standalone_rrv_plot_basic", "--category",
        "exposure_type_encode"
    ])
    assert result.exit_code == 0
    # TODO now we can validate the rank plot and sample plot JSON and make sure
    # it's good. Get the sample plot validation code from the old github page
    # -- that'll satisfy one of the merging things.
