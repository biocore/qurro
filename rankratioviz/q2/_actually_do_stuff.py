# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import logging
import q2templates
from rankratioviz.generate import process_input, gen_visualization


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
        df_feature_metadata = feature_metadata.to_dataframe()
    df_sample_metadata = sample_metadata.to_dataframe()
    logging.debug("Converted metadata to DataFrames.")

    U, V, processed_table = process_input(
        feature_ranks,
        df_sample_metadata,
        table,
        df_feature_metadata,
        extreme_feature_count,
    )
    # We can't "subscript" Q2 Metadata types, so we have to convert this to a
    # dataframe before working with it
    index_path = gen_visualization(V, processed_table, U, output_dir)
    # render the visualization using q2templates.render().
    # TODO: do we need to specify plot_name in the context in this way? I'm not
    # sure where it is being used in the first place, honestly.
    plot_name = output_dir.split("/")[-1]
    q2templates.render(
        index_path, output_dir, context={"plot_name": plot_name}
    )
