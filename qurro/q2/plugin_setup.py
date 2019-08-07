# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# NOTE: This is based on DEICODE's deicode/q2/plugin_setup.py file.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import qiime2.plugin
import qiime2.sdk
from qurro import __version__
from ._method import differential_plot, loading_plot
from qurro._parameter_descriptions import EXTREME_FEATURE_COUNT, TABLE, DEBUG
from qiime2.plugin import Metadata, Properties, Int, Bool
from q2_types.feature_table import FeatureTable, Frequency
from q2_types.ordination import PCoAResults

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
