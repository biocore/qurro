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
import q2templates
from rankratioviz.generate import process_input, gen_visualization
from typing import cast  # should also eventually import Union (see below)


def plot(output_dir: str,
         # NOTE This should eventually have the type
         # Union[skbio.OrdinationResults, pd.DataFrame], but for some reason
         # that gives a QIIME 2 error. For now you can circumvent this by
         # hardcoding in one of those two types here to support either DEICODE
         # or songbird data, respectively.
         ranks: pd.DataFrame,
         table: biom.Table, sample_metadata: qiime2.Metadata,
         feature_metadata: qiime2.Metadata) -> None:
    """Generates a .qzv file containing a rankratioviz visualization.

       (...Also, the reason the order of parameters here differs from
       rankratioviz/scripts/_plot.py is that the first parameter has to be
       output_dir: str, per QIIME 2's plugin requirements.)
    """

    # Process input ranks
    feature_ranks = None
    if type(ranks) == skbio.OrdinationResults:
        cast(ranks, skbio.OrdinationResults)
        feature_ranks = ranks.features

    elif type(ranks) == pd.DataFrame:
        cast(ranks, pd.DataFrame)
        # TODO: is this always gonna be necessary?
        # We use index_col=0 when we read the .tsv file in the standalone
        # script, but I don't think Q2 is using it.
        feature_ranks = ranks.set_index(ranks.columns[0])

    else:
        raise skbio.io.UnrecognizedFormatError("Unclear input ranks filetype")

    df_feature_metadata = feature_metadata.to_dataframe()
    df_sample_metadata = sample_metadata.to_dataframe()
    V, processed_table = process_input(feature_ranks, df_sample_metadata,
                                       table, df_feature_metadata)
    # We can't "subscript" Q2 Metadata types, so we have to convert this to a
    # dataframe before working with it
    index_path = gen_visualization(V, processed_table, df_sample_metadata,
                                   output_dir)
    # render the visualization using q2templates.render().
    # TODO: do we need to specify plot_name in the context in this way? I'm not
    # sure where it is being used in the first place, honestly.
    plot_name = output_dir.split('/')[-1]
    q2templates.render(index_path, output_dir,
                       context={'plot_name': plot_name})
