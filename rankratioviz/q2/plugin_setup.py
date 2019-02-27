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
from ._method import plot
from qiime2.plugin import (Metadata, Properties)
from q2_types.feature_table import (FeatureTable, Frequency)
from q2_types.feature_data import FeatureData
from q2_types.ordination import PCoAResults

# DEICODE's input is PCoAResults % Properties("biplot").
# songbird's input is FeatureData[Differential].
# If songbird is installed, we can access its Differential type
accepted_rank_types = PCoAResults % Properties("biplot")
# These are the possible descriptions for the "ranks" input argument. We change
# this based on whether or not songbird is installed.
deicode_rank_desc = ("An ordination file describing feature ranks produced by"
                     + " DEICODE. (In order for this to accept songbird input,"
                     + " you'll need to install songbird.)")
both_rank_desc = ("Either an ordination file describing feature ranks produced"
                  + " by DEICODE, or a differentials file produced by"
                  + " songbird.")
rank_desc = deicode_rank_desc

try:
    from songbird.q2 import Differential
    # Update accepted rank types (and this argument's description) accordingly
    accepted_rank_types |= FeatureData[Differential]
    rank_desc = both_rank_desc
except ImportError:
    # Couldn't import Differential from songbird. This means rankratioviz will
    # only accept DEICODE output.
    pass

plugin = qiime2.plugin.Plugin(
    name='rankratioviz',
    version=__version__,
    website="https://github.com/fedarko/rankratioviz",
    # citations=[citations['martino-unpublished']],
    short_description=('Plugin for visualizing taxon/metabolite ranks and'
                       + ' log ratios.'),
    description=("""This QIIME 2 plugin supports the visualization of
        taxon/metabolite ranks (output by a tool like songbird or DEICODE) in
        tandem with log ratios of their abundances in samples."""),
    package='rankratioviz'
)

plugin.visualizers.register_function(
    function=plot,
    inputs={'ranks': accepted_rank_types,
            'table': FeatureTable[Frequency]},
    parameters={'sample_metadata': Metadata,
                'feature_metadata': Metadata},
    input_descriptions={
        # TODO clearer descriptions here
        'ranks': rank_desc,
        'table': "A BIOM table describing the abundances of the ranked"
                 + " taxa/metabolites in samples"
    },
    parameter_descriptions={
        'sample_metadata': 'Metadata file describing samples',
        'feature_metadata': 'Feature metadata (indicating taxonomy)',
    },
    name='Generate a rankratioviz plot',
    description="Generates an interactive visualization of ranks in tandem"
                + " with a visualization of the log ratios of selected ranks'"
                + " sample abundance."
)
