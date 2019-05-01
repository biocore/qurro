# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# NOTE: This is based on DEICODE's deicode/q2/plugin_setup.py file.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import qiime2.plugin
import qiime2.sdk
from rankratioviz import __version__
from ._method import supervised_rank_plot, unsupervised_rank_plot
from qiime2.plugin import Metadata, Properties
from q2_types.feature_table import FeatureTable, Frequency
from q2_types.feature_data import FeatureData
from q2_types.ordination import PCoAResults

songbird_accessible = False
try:
    from songbird.q2 import Differential

    songbird_accessible = True
except ImportError:
    # Couldn't import Differential from songbird. This means rankratioviz will
    # only accept DEICODE output.
    pass

plugin = qiime2.plugin.Plugin(
    name="rankratioviz",
    version=__version__,
    website="https://github.com/fedarko/rankratioviz",
    # citations=[citations['martino-unpublished']],
    short_description=("Plugin for visualizing feature ranks and log ratios."),
    description=(
        """This QIIME 2 plugin supports the visualization of
        feature ranks (output by a tool like songbird or DEICODE) in
        tandem with log ratios of their abundances within samples."""
    ),
    package="rankratioviz",
)

# Shared stuff between the two plot options
params = {"sample_metadata": Metadata, "feature_metadata": Metadata}

ranks_desc = "A {} file describing ranks produced by {}"
table_desc = (
    "A BIOM table describing the abundances of the ranked features"
    + " in samples."
)

short_desc = "Generate a rankratioviz plot from {} data"
long_desc = (
    "Generates an interactive visualization of {} ranks in tandem"
    + " with a visualization of the log ratios of selected ranks'"
    + " sample abundance."
)

if songbird_accessible:
    plugin.visualizers.register_function(
        function=supervised_rank_plot,
        inputs={
            "ranks": FeatureData[Differential],
            "table": FeatureTable[Frequency],
        },
        parameters=params,
        input_descriptions={
            "ranks": ranks_desc.format("differentials", "songbird"),
            "table": table_desc,
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
    input_descriptions={
        "ranks": ranks_desc.format("ordination", "DEICODE"),
        "table": table_desc,
    },
    name=short_desc.format("DEICODE"),
    description=long_desc.format("DEICODE"),
)
