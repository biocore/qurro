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
from ._method import differential_plot, loading_plot
from ._type import LogRatios, LogRatiosDirFmt, LogRatiosFormat
from qurro._parameter_descriptions import EXTREME_FEATURE_COUNT, TABLE, DEBUG
from qiime2.plugin import Metadata, Properties, Int, Bool, Str
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
        "sorted numerically these provide rankings) in tandem with log-ratios "
        "of features' abundances within samples."
    ),
    package="qurro",
)

# Shared stuff between the two plot options
params = {
    "sample_metadata": Metadata,
    "feature_metadata": Metadata,
    "extreme_feature_count": Int,
    "debug": Bool,
    # "assume_gnps_feature_metadata": Bool,
}

param_descs = {
    "extreme_feature_count": EXTREME_FEATURE_COUNT,
    "debug": DEBUG
    + (
        " Note that you'll also need to use the --verbose option to see these "
        "messages."
    ),
    # "assume_gnps_feature_metadata": ASSUME_GNPS_FEATURE_METADATA,
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
    "taxonomy": Metadata,
    "samples_to_use": Metadata,
    "allow_shared_features": Bool,
}

qarcoal_param_descs = {
    "num_string": "numerator string to search for in taxonomy",
    "denom_string": "denominator string to search for in taxonomy",
    "taxonomy": "Qiime2 Metadata with taxonomy information",
    "samples_to_use": "Qiime2 Metadata with samples to use",
    "allow_shared_features": ("whether to raise error if features \
        are shared between numerator and denominator")
}

plugin.methods.register_function(
    function=qarcoal,
    inputs={"table": FeatureTable[Frequency]},
    parameters=qarcoal_params,
    parameter_descriptions=qarcoal_param_descs,
    input_descriptions={"table": TABLE},
    outputs=[("qarcoal_log_ratios", SampleData[LogRatios])],
    description=(
        "Compute the log ratio of two specified feature strings by"
        + "searching taxonomy for incidence of each string, summing"
        + "all relevant feature counts for each sample, and taking"
        + "the natural log of the numerator sum divided by denominator"
        + "sum."
    ),
    name="Compute numerator:denominator feature log ratios",
)


importlib.import_module("qurro.q2._transformer")

# Register types
plugin.register_formats(LogRatiosFormat, LogRatiosDirFmt)
plugin.register_semantic_types(LogRatios)
plugin.register_semantic_type_to_format(
    SampleData[LogRatios], artifact_format=LogRatiosDirFmt
)
