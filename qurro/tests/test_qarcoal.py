#!/usr/bin/env python

from collections import namedtuple
import os

import biom
import pandas as pd
import pytest
from q2_types.sample_data import SampleData
from qiime2 import Metadata
from qiime2.plugin.testing import TestPluginBase
from qurro.qarcoal import qarcoal
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
    taxonomy = Metadata(taxonomy)
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
            qarcoal(get_mp_data.table,
                    get_mp_data.taxonomy,
                    num,
                    denom,
                    allow_shared_features=False)
        assert "Shared features" in str(excinfo.value)


class TestOptionalParams:
    def test_shared_features_allowed(self, get_mp_data):
        num = "Firmicutes"
        denom = "Bacilli"
        qarcoal(get_mp_data.table,
                get_mp_data.taxonomy,
                num,
                denom,
                allow_shared_features=True)

    def test_samples_to_use(self, get_mp_data):
        from qiime2 import Metadata

        metadata_url = os.path.join(MP_URL, "sample-metadata.tsv")
        sample_metadata = pd.read_csv(metadata_url, sep="\t", index_col=0,
                                      skiprows=[1], header=0)
        gut_samples = sample_metadata[sample_metadata['BodySite'] == 'gut']
        num_gut_samples = gut_samples.shape[0]
        gut_samples = Metadata(gut_samples)

        num = "p__Bacteroidetes"
        denom = "p__Firmicutes"
        q = qarcoal(get_mp_data.table,
                    get_mp_data.taxonomy,
                    num,
                    denom,
                    samples_to_use=gut_samples)
        assert q.shape[0] == num_gut_samples
