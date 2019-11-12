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
from qurro.q2._type import QarcoalLogRatios, QarcoalLogRatiosDirFmt


class TestTypes(TestPluginBase):
    package = "qurro.tests"

    def test_qlr_semantic_type_registration(self):
        self.assertRegisteredSemanticType(QarcoalLogRatios)

    def test_qlr_to_qlr_dir(self):
        self.assertSemanticTypeRegisteredToFormat(
            SampleData[QarcoalLogRatios], QarcoalLogRatiosDirFmt)


@pytest.fixture(scope="module")
def get_mp_data():
    mp_url = "input/moving_pictures"

    biom_url = os.path.join(mp_url, "feature-table.biom")
    taxonomy_url = os.path.join(mp_url, "taxonomy.tsv")

    table = biom.load_table(biom_url)
    taxonomy = pd.read_csv(taxonomy_url, sep="\t", index_col=0)
    taxonomy = Metadata(taxonomy)
    data = namedtuple('Data', 'table taxonomy')
    return data(table, taxonomy)


@pytest.fixture(scope="module")
def get_mp_results(get_mp_data):
    q = qarcoal(get_mp_data.table, get_mp_data.taxonomy, 'Bact', 'Firm')
    return q


class TestQarcoalOutput:
    def test_type(self, get_mp_results):
        assert isinstance(get_mp_results, pd.DataFrame)

    def test_shape(self, get_mp_data, get_mp_results):
        nrow_biom = len(get_mp_data.table.ids(axis='sample'))
        nrow_qarcoal = get_mp_results.shape[0]
        assert nrow_biom == nrow_qarcoal

    def test_samples(self, get_mp_data, get_mp_results):
        samp_biom = set(get_mp_data.table.ids(axis='sample'))
        samp_qarcoal = set(get_mp_results.index)
        assert samp_biom == samp_qarcoal


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

    def test_same_features(self, get_mp_data):
        num = "Firmicutes"
        denom = "Firmicutes"
        with pytest.raises(ValueError) as excinfo:
            qarcoal(get_mp_data.table, get_mp_data.taxonomy, num, denom)
        assert "same features!" == str(excinfo.value)
