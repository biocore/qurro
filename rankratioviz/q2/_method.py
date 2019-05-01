# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import qiime2
import skbio
import pandas as pd
import biom
from ._actually_do_stuff import create_q2_visualization


def supervised_rank_plot(
    output_dir: str,
    ranks: pd.DataFrame,
    table: biom.Table,
    sample_metadata: qiime2.Metadata,
    feature_metadata: qiime2.Metadata = None,
) -> None:
    """Generates a .qzv file of a RRV visualization from songbird data.

       (...Also, the reason the order of parameters here differs from
       rankratioviz/scripts/_plot.py is that the first parameter has to be
       output_dir: str, per QIIME 2's plugin requirements.)
    """

    create_q2_visualization(
        output_dir, ranks, table, sample_metadata, feature_metadata
    )


def unsupervised_rank_plot(
    output_dir: str,
    ranks: skbio.OrdinationResults,
    table: biom.Table,
    sample_metadata: qiime2.Metadata,
    feature_metadata: qiime2.Metadata = None,
) -> None:
    """Generates a .qzv file of a RRV visualization from DEICODE data."""

    create_q2_visualization(
        output_dir, ranks.features, table, sample_metadata, feature_metadata
    )
