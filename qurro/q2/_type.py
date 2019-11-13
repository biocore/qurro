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

LogRatios = SemanticType("LogRatios", variant_of=SampleData.field["type"])


class LogRatiosFormat(model.TextFileFormat):
    def validate(*args):
        pass


LogRatiosDirFmt = model.SingleFileDirectoryFormat(
    "LogRatiosDirFmt", "log_ratios.tsv", LogRatiosFormat
)
