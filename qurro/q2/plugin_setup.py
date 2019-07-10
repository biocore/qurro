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
from ._method import supervised_rank_plot, unsupervised_rank_plot
from qurro._parameter_descriptions import EXTREME_FEATURE_COUNT, TABLE
from qiime2.plugin import Metadata, Properties, Int
from q2_types.feature_table import FeatureTable, Frequency
from q2_types.feature_data import FeatureData
from q2_types.ordination import PCoAResults

songbird_accessible = False
try:
    from songbird.q2 import Differential

    songbird_accessible = True
except ImportError:
    # Couldn't import Differential from songbird. This means qurro will
    # only accept DEICODE output.
    pass

plugin = qiime2.plugin.Plugin(
    name="qurro",
    version=__version__,
    website="https://github.com/biocore/qurro",
    # citations=[citations['martino-unpublished']],
    short_description=("Plugin for visualizing feature ranks and log ratios."),
    description=(
        """This QIIME 2 plugin supports the visualization of
        feature ranks (output by a tool like songbird or DEICODE) in
        tandem with log ratios of their abundances within samples."""
    ),
    package="qurro",
)

# Shared stuff between the two plot options
params = {
    "sample_metadata": Metadata,
    "feature_metadata": Metadata,
    "extreme_feature_count": Int,
    # "assume_gnps_feature_metadata": Bool,
}

param_descs = {
    "extreme_feature_count": EXTREME_FEATURE_COUNT,
    # "assume_gnps_feature_metadata": ASSUME_GNPS_FEATURE_METADATA,
}

ranks_desc = "A{} file describing feature rankings produced by {}."

short_desc = "Generate a Qurro visualization from {} data"
long_desc = (
    "Generates an interactive visualization of {} feature rankings in tandem"
    + " with a visualization of the log ratios of selected features'"
    + " sample abundances."
)

if songbird_accessible:
    plugin.visualizers.register_function(
        function=supervised_rank_plot,
        inputs={
            "ranks": FeatureData[Differential],
            "table": FeatureTable[Frequency],
        },
        parameters=params,
        parameter_descriptions=param_descs,
        input_descriptions={
            "ranks": ranks_desc.format(" differentials", "songbird"),
            "table": TABLE,
        },
        name=short_desc.format("songbird"),
        description=long_desc.format("songbird"),
    )

plugin.visualizers.register_function(
    function=unsupervised_rank_plot,
    inputs={
        "ranks": PCoAResults % Properties("biplot"),
        "table": FeatureTable[Frequency],
    },
    parameters=params,
    parameter_descriptions=param_descs,
    input_descriptions={
        "ranks": ranks_desc.format("n ordination", "DEICODE"),
        "table": TABLE,
    },
    name=short_desc.format("DEICODE"),
    description=long_desc.format("DEICODE"),
)
