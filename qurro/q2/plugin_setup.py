# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# NOTE: This is based on DEICODE's deicode/q2/plugin_setup.py file.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import importlib

import qiime2.plugin
import qiime2.sdk
from qurro import __version__
from qurro.qarcoal import qarcoal
from ._visualizers import differential_plot, loading_plot
from qurro._parameter_descriptions import (
    TABLE,
    EXTREME_FEATURE_COUNT,
    DEBUG,
    Q2_SAMPLE_METADATA,
    Q2_FEATURE_METADATA,
)
from qiime2.plugin import Metadata, Properties, Int, Bool, Str
from ._type import LogRatios, LogRatiosDirFmt, LogRatiosFormat
from qurro import _qarcoal_param_descriptions as QPD
from q2_types.feature_data import Taxonomy
from q2_types.feature_table import FeatureTable, Frequency
from q2_types.ordination import PCoAResults
from q2_types.sample_data import SampleData

# Gracefully fail if the user is using an old version of QIIME 2. I expect this
# will pop up a lot as people switch from 2019.4 to 2019.7. (We can remove this
# in the future if desired.)
try:
    from q2_types.feature_data import FeatureData, Differential
except ImportError:
    raise SystemError(
        "It looks like you're using a version of QIIME 2 before 2019.7. "
        "Starting with Qurro v0.3.0, Qurro only supports versions of QIIME 2 "
        "of at least 2019.7. Please install a later version of QIIME 2 in "
        "order to install Qurro v0.3.0. You can also uninstall Qurro in order "
        "to fix the current QIIME 2 environment."
    )

plugin = qiime2.plugin.Plugin(
    name="qurro",
    version=__version__,
    website="https://github.com/biocore/qurro",
    # citations=[citations['martino-unpublished']],
    short_description=(
        "Plugin for visualizing feature rankings and log-ratios."
    ),
    description=(
        "This QIIME 2 plugin supports the interactive visualization of "
        "feature rankings (either differentials or feature loadings -- when "
        "sorted numerically these provide rankings) in tandem with feature "
        "log-ratios across samples."
    ),
    package="qurro",
)

# Shared stuff between the two plot options
params = {
    "sample_metadata": Metadata,
    "feature_metadata": Metadata,
    "extreme_feature_count": Int,
    "debug": Bool,
}

param_descs = {
    "sample_metadata": Q2_SAMPLE_METADATA,
    "feature_metadata": Q2_FEATURE_METADATA,
    "extreme_feature_count": EXTREME_FEATURE_COUNT,
    "debug": DEBUG
    + (
        " Note that you'll also need to use the --verbose option to see these "
        "messages."
    ),
}

short_desc = "Generate a Qurro visualization from feature {}s"
long_desc = (
    "Generates an interactive visualization of feature {}s in tandem"
    + " with a visualization of the log-ratios of selected features'"
    + " sample abundances."
)

plugin.visualizers.register_function(
    function=differential_plot,
    inputs={
        "ranks": FeatureData[Differential],
        "table": FeatureTable[Frequency],
    },
    parameters=params,
    parameter_descriptions=param_descs,
    input_descriptions={"ranks": "Feature differentials.", "table": TABLE},
    name=short_desc.format("differential"),
    description=long_desc.format("differential"),
)

plugin.visualizers.register_function(
    function=loading_plot,
    inputs={
        "ranks": PCoAResults % Properties("biplot"),
        "table": FeatureTable[Frequency],
    },
    parameters=params,
    parameter_descriptions=param_descs,
    input_descriptions={
        "ranks": "A biplot containing feature loadings.",
        "table": TABLE,
    },
    name=short_desc.format("loading"),
    description=long_desc.format("loading"),
)

qarcoal_params = {
    "num_string": Str,
    "denom_string": Str,
    "samples_to_use": Metadata,
    "allow_shared_features": Bool,
}

qarcoal_param_descs = {
    "num_string": QPD.QARCOAL_NUM,
    "denom_string": QPD.QARCOAL_DENOM,
    "samples_to_use": QPD.QARCOAL_SMP_TO_USE,
    "allow_shared_features": QPD.QARCOAL_SHARED_FEAT,
}

plugin.methods.register_function(
    function=qarcoal,
    inputs={
        "table": FeatureTable[Frequency],
        "taxonomy": FeatureData[Taxonomy],
    },
    parameters=qarcoal_params,
    parameter_descriptions=qarcoal_param_descs,
    input_descriptions={
        "table": QPD.QARCOAL_TBL,
        "taxonomy": QPD.QARCOAL_TAXONOMY,
    },
    outputs=[("qarcoal_log_ratios", SampleData[LogRatios])],
    description=QPD.QARCOAL_DESC,
    name="Compute feature log-ratios based on textual taxonomy searching.",
)


# this line may be necessary to register transformers
# found in songbird's plugin_setup file as well as Q2 forum post
# https://github.com/biocore/songbird/blob/master/songbird/q2/plugin_setup.py
# https://forum.qiime2.org/t/question-about-error-no-transformation-class-for-dataframe-to-dir/4576
importlib.import_module("qurro.q2._transformer")

# Register types
plugin.register_formats(LogRatiosFormat, LogRatiosDirFmt)
plugin.register_semantic_types(LogRatios)
plugin.register_semantic_type_to_format(
    SampleData[LogRatios], artifact_format=LogRatiosDirFmt
)
