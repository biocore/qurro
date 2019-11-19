#!/usr/bin/env python

from collections import namedtuple
import os

import biom
import numpy as np
import pandas as pd
import pytest
from q2_types.sample_data import SampleData
from qiime2 import Metadata
from qiime2.plugin.testing import TestPluginBase
from qurro.qarcoal import qarcoal, filter_and_join_taxonomy
from qurro.q2._type import LogRatios, LogRatiosDirFmt

MP_URL = "qurro/tests/input/moving_pictures"


class TestTypes(TestPluginBase):
    package = "qurro.tests"

    def test_qlr_semantic_type_registration(self):
        self.assertRegisteredSemanticType(LogRatios)

    def test_qlr_to_qlr_dir(self):
        self.assertSemanticTypeRegisteredToFormat(
            SampleData[LogRatios], LogRatiosDirFmt
        )


@pytest.fixture(scope="module")
def get_mp_data():
    biom_url = os.path.join(MP_URL, "feature-table.biom")
    taxonomy_url = os.path.join(MP_URL, "taxonomy.tsv")

    table = biom.load_table(biom_url)
    taxonomy = pd.read_csv(taxonomy_url, sep="\t", index_col=0)
    data = namedtuple("Data", "table taxonomy")
    return data(table, taxonomy)


@pytest.fixture(scope="module")
def get_mp_results(get_mp_data):
    num = "g__Bacteroides"
    denom = "g__Streptococcus"
    q = qarcoal(get_mp_data.table, get_mp_data.taxonomy, num, denom)
    return q


@pytest.fixture(scope="module")
def get_qurro_mp_results():
    qurro_url = os.path.join(MP_URL, "qurro_bacteroides_streptococcus.tsv")
    results = pd.read_csv(qurro_url, sep="\t", index_col=0)
    # index: Sample ID
    # columns: Current_Log_Ratio, BodySite, BodySite
    return results


class TestQarcoalOutput:
    def test_type(self, get_mp_results):
        assert isinstance(get_mp_results, pd.DataFrame)

    def test_shape(self, get_mp_data, get_mp_results, get_qurro_mp_results):
        qurro_results = get_qurro_mp_results.dropna()
        nrow_qurro = qurro_results.shape[0]
        nrow_qarcoal = get_mp_results.shape[0]
        assert nrow_qurro == nrow_qarcoal

    def test_samples(self, get_mp_data, get_mp_results, get_qurro_mp_results):
        qurro_results = get_qurro_mp_results.dropna()
        samp_qurro = set(qurro_results.index)
        samp_qarcoal = set(get_mp_results.index)
        assert samp_qurro == samp_qarcoal

    def test_log_ratios_1(self, get_mp_results, get_qurro_mp_results):
        qurro_results = get_qurro_mp_results.dropna()
        qurro_results = qurro_results[["Current_Log_Ratio"]]
        qurro_results = qurro_results.sort_values(by="Current_Log_Ratio")
        qurro_results = qurro_results.to_numpy()

        qarcoal_results = get_mp_results[["log_ratio"]]
        qarcoal_results = qarcoal_results.sort_values(by="log_ratio")
        qarcoal_results = qarcoal_results.to_numpy()

        assert qarcoal_results - qurro_results == pytest.approx(0)


class TestErrors:
    def test_invalid_num(self, get_mp_data):
        num = "beyblade"
        denom = "Firm"
        with pytest.raises(ValueError) as excinfo:
            qarcoal(get_mp_data.table, get_mp_data.taxonomy, num, denom)
        assert "numerator not found!" == str(excinfo.value)

    def test_invalid_denom(self, get_mp_data):
        num = "Firm"
        denom = "beyblade"
        with pytest.raises(ValueError) as excinfo:
            qarcoal(get_mp_data.table, get_mp_data.taxonomy, num, denom)
        assert "denominator not found!" == str(excinfo.value)

    def test_both_invalid(self, get_mp_data):
        num = "beyblade"
        denom = "yugioh"
        with pytest.raises(ValueError) as excinfo:
            qarcoal(get_mp_data.table, get_mp_data.taxonomy, num, denom)
        assert "neither feature found!" == str(excinfo.value)

    def test_shared_features_disallowed(self, get_mp_data):
        num = "Firmicutes"
        denom = "Bacilli"
        with pytest.raises(ValueError) as excinfo:
            qarcoal(
                get_mp_data.table,
                get_mp_data.taxonomy,
                num,
                denom,
                allow_shared_features=False,
            )
        assert "Shared features" in str(excinfo.value)


class TestOptionalParams:
    def test_shared_features_allowed(self, get_mp_data):
        num = "Firmicutes"
        denom = "Bacilli"
        qarcoal(
            get_mp_data.table,
            get_mp_data.taxonomy,
            num,
            denom,
            allow_shared_features=True,
        )

    def test_samples_to_use(self, get_mp_data):
        metadata_url = os.path.join(MP_URL, "sample-metadata.tsv")
        sample_metadata = pd.read_csv(
            metadata_url, sep="\t", index_col=0, skiprows=[1], header=0
        )
        gut_samples = sample_metadata[sample_metadata["BodySite"] == "gut"]
        num_gut_samples = gut_samples.shape[0]
        gut_samples = Metadata(gut_samples)

        num = "p__Bacteroidetes"
        denom = "p__Firmicutes"
        q = qarcoal(
            get_mp_data.table,
            get_mp_data.taxonomy,
            num,
            denom,
            samples_to_use=gut_samples,
        )
        assert q.shape[0] == num_gut_samples


class TestIrregularData():
    @pytest.fixture(scope="class")
    def get_testing_data(self):
        mat = [np.random.randint(0, 10) for x in range(30)]
        mat = np.reshape(mat, (6, 5))
        samps = ["S{}".format(i) for i in range(5)]
        feats = ["F{}".format(i) for i in range(6)]
        table = biom.table.Table(mat, feats, samps)
        tax_labels = [
            "Bulbasaur",
            "Ivysaur",
            "Venusaur",
            "Charmander",
            "Charmeleon",
            "Charizard",
        ]
        confidence = ["0.99"] * 6
        taxonomy = pd.DataFrame([
            feats,
            tax_labels,
            confidence,
        ]).T
        taxonomy.columns = ["feature-id", "Taxon", "Confidence"]
        taxonomy.set_index("feature-id", inplace=True, drop=True)
        data = namedtuple("Data", "table taxonomy")
        return data(table, taxonomy)

    def test_taxonomy_missing_features(self, get_testing_data):
        """Taxonomy file missing features that are present in feature table"""
        table = get_testing_data.table.to_dataframe()
        taxonomy = get_testing_data.taxonomy
        taxonomy_miss = taxonomy.iloc[:-1, :]  # remove F5 from taxonomy
        num_df, denom_df = filter_and_join_taxonomy(
            get_testing_data.table.to_dataframe(),
            taxonomy_miss,
            "Char",
            "saur",
        )

        # F5 dropped out
        assert "F5" not in num_df.index

        num_features = ["F3", "F4"]
        denom_features = ["F1", "F2"]
        sample_order = ["S{}".format(i) for i in range(5)]

        table_num_taxon_filt = pd.DataFrame(table.loc[num_features])
        table_denom_taxon_filt = pd.DataFrame(table.loc[denom_features])

        num_df_taxon_filt = num_df.loc[num_features]
        denom_df_taxon_filt = denom_df.loc[denom_features]

        # set operations in Qarcoal change order of samples
        table_num_taxon_filt = table_num_taxon_filt[sample_order]
        table_denom_taxon_filt = table_denom_taxon_filt[sample_order]
        num_df_taxon_filt = num_df_taxon_filt[sample_order]
        denom_df_taxon_filt = denom_df_taxon_filt[sample_order]

        # test that num/denom df accurately extract values from table
        assert table_num_taxon_filt.equals(num_df_taxon_filt)
        assert table_denom_taxon_filt.equals(denom_df_taxon_filt)

    def test_feat_table_missing_features(self, get_testing_data):
        """Feature table missing features that are present in taxonomy"""
        table = get_testing_data.table.to_dataframe()
        table = table.iloc[:-1, :]  # remove F5 from feature table
        num_df, denom_df = filter_and_join_taxonomy(
            table,
            get_testing_data.taxonomy,
            "Char",
            "saur",
        )

        # F5 dropped out
        assert "F5" not in num_df.index

        num_features = ["F3", "F4"]
        denom_features = ["F1", "F2"]
        sample_order = ["S{}".format(i) for i in range(5)]

        table_num_taxon_filt = pd.DataFrame(table.loc[num_features])
        table_denom_taxon_filt = pd.DataFrame(table.loc[denom_features])

        num_df_taxon_filt = num_df.loc[num_features]
        denom_df_taxon_filt = denom_df.loc[denom_features]

        # set operations in Qarcoal change order of samples
        table_num_taxon_filt = table_num_taxon_filt[sample_order]
        table_denom_taxon_filt = table_denom_taxon_filt[sample_order]
        num_df_taxon_filt = num_df_taxon_filt[sample_order]
        denom_df_taxon_filt = denom_df_taxon_filt[sample_order]

        # test that num/denom df accurately extract values from table
        assert table_num_taxon_filt.equals(num_df_taxon_filt)
        assert table_denom_taxon_filt.equals(denom_df_taxon_filt)

    def test_overlapping_columns(self, get_testing_data):
        """Feature table and taxonomy have overlapping column(s)"""
        table = get_testing_data.table.to_dataframe()
        taxonomy = get_testing_data.taxonomy.copy()

        taxonomy["Overlap1"] = [np.random.randint(0, 10) for x in range(6)]
        table["Overlap1"] = [np.random.randint(0, 10) for x in range(6)]
        taxonomy["Overlap2"] = [np.random.randint(0, 10) for x in range(6)]
        table["Overlap2"] = [np.random.randint(0, 10) for x in range(6)]
        table = table.apply(lambda x: x.astype(np.float64))

        num_df, denom_df = filter_and_join_taxonomy(
            table,
            taxonomy,
            "Char",
            "saur",
        )

        num_features = ["F3", "F4", "F5"]
        denom_features = ["F1", "F2"]
        for col in ["Overlap1", "Overlap2"]:
            table_num_taxon_filt = pd.Series(
                table.loc[num_features][col]
            )
            table_denom_taxon_filt = pd.Series(
                table.loc[denom_features][col]
            )
            num_df_taxon_filt = num_df.loc[num_features][col]
            denom_df_taxon_filt = denom_df.loc[denom_features][col]

            # test that num/denom df accurately extract table values for
            #  Overlap1 and Overlap2
            assert table_num_taxon_filt.equals(num_df_taxon_filt)
            assert table_denom_taxon_filt.equals(denom_df_taxon_filt)

    def test_taxon_as_sample_name(self, get_testing_data):
        """Feature table has sample called Taxon"""
        table = get_testing_data.table.to_dataframe().copy()
        table["Taxon"] = [np.random.randint(0, 10) for x in range(6)]
        table["Taxon"] = table["Taxon"].astype(np.float64)

        num_df, denom_df = filter_and_join_taxonomy(
            table,
            get_testing_data.taxonomy,
            "Char",
            "saur",
        )

        # test that num/denom df accurately extract table values for Taxon
        num_features = ["F3", "F4", "F5"]
        denom_features = ["F1", "F2"]
        table_num_taxon_filt = pd.Series(table.loc[num_features]["Taxon"])
        table_denom_taxon_filt = pd.Series(table.loc[denom_features]["Taxon"])
        num_df_taxon_filt = num_df.loc[num_features]["Taxon"]
        denom_df_taxon_filt = denom_df.loc[denom_features]["Taxon"]

        assert table_num_taxon_filt.equals(num_df_taxon_filt)
        assert table_denom_taxon_filt.equals(denom_df_taxon_filt)

    def test_large_numbers(self):
        # Qurro fails when x > |2^53 - 1| due to JS implementation
        bignum = 2 ** 53 - 1
        large_vals = [
            np.random.randint(bignum + 1, bignum * 2) for x in range(30)
        ]
        mat = np.reshape(large_vals, (6, 5))
        samps = ["S{}".format(i) for i in range(5)]
        feats = ["F{}".format(i) for i in range(6)]
        table = biom.table.Table(mat, feats, samps)
        tax_labels = [
            "Bulbasaur",
            "Ivysaur",
            "Venusaur",
            "Charmander",
            "Charmeleon",
            "Charizard",
        ]
        confidence = ["0.99"] * 6
        taxonomy = pd.DataFrame([feats, tax_labels, confidence]).T
        taxonomy.columns = ["feature-id", "Taxon", "Confidence"]
        taxonomy.set_index("feature-id", inplace=True, drop=True)
        qarcoal(table, taxonomy, "Char", "saur")
