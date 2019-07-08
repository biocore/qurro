# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import logging
import q2templates
from qurro.generate import process_and_generate
from qurro._df_utils import escape_columns


def create_q2_visualization(
    output_dir,
    feature_ranks,
    table,
    sample_metadata,
    feature_metadata,
    extreme_feature_count,
):

    logging.debug("Starting create_q2_visualization().")
    df_feature_metadata = None
    if feature_metadata is not None:
        df_feature_metadata = escape_columns(
            feature_metadata.to_dataframe(), "feature metadata"
        )
    df_sample_metadata = escape_columns(
        sample_metadata.to_dataframe(), "sample metadata"
    )
    logging.debug("Converted metadata to DataFrames.")

    feature_ranks = escape_columns(feature_ranks, "feature ranks")

    index_path = process_and_generate(
        feature_ranks,
        df_sample_metadata,
        table,
        output_dir,
        df_feature_metadata,
        extreme_feature_count,
    )
    # render the visualization using q2templates.render().
    # TODO: do we need to specify plot_name in the context in this way? I'm not
    # sure where it is being used in the first place, honestly.
    plot_name = output_dir.split("/")[-1]
    q2templates.render(
        index_path, output_dir, context={"plot_name": plot_name}
    )
