#!/usr/bin/env python3
# Copyright (c) 2018--, Qurro development team.
#
# NOTE: This is based on songbird's songbird/q2/_stats.py file.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

from q2_types.sample_data import SampleData
from qiime2.plugin import model, SemanticType

QarcoalLogRatios = SemanticType(
    'QarcoalLogRatios',
    variant_of = SampleData.field['type'])

class QarcoalLogRatiosFormat(model.TextFileFormat):
    def validate(**args):
        pass

QarcoalLogRatiosDirFmt = model.SingleFileDirectoryFormat(
    'QarcoalLogRatiosDirFmt', 'log_ratios.tsv', QarcoalLogRatiosFormat)
