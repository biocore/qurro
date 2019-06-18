#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
#
# Generates two JSON files: one for a rank plot and one for a sample
# scatterplot of log ratios.
#
# A lot of the code for processing input data in this file was based on code
# by Jamie Morton, some of which is now located in ipynb/Figure3.ipynb in
# https://github.com/knightlab-analyses/reference-frames.
# ----------------------------------------------------------------------------

import os
import logging

# import re
from shutil import copyfile, copytree
import pandas as pd
import altair as alt
from qurro._rank_utils import filter_unextreme_features
from qurro._json_utils import replace_js_json_definitions
from qurro._metadata_utils import replace_nan, validate_df, escape_columns


def matchdf(df1, df2):
    """Filters both DataFrames to just the rows of their shared indices.

       Derived from gneiss.util.match() (https://github.com/biocore/gneiss).
    """

    idx = set(df1.index) & set(df2.index)
    return df1.loc[idx], df2.loc[idx]


def process_and_generate(
    feature_ranks,
    sample_metadata,
    biom_table,
    output_dir,
    feature_metadata=None,
    extreme_feature_count=None,
):
    """Just calls process_input() and gen_visualization()."""
    U, V, ranking_ids, feature_metadata_cols, processed_table = process_input(
        feature_ranks,
        sample_metadata,
        biom_table,
        feature_metadata,
        extreme_feature_count,
    )
    return gen_visualization(
        V, ranking_ids, feature_metadata_cols, processed_table, U, output_dir
    )


def process_input(
    feature_ranks,
    sample_metadata,
    biom_table,
    feature_metadata=None,
    extreme_feature_count=None,
):
    """Processes the input files to Qurro."""

    logging.debug("Starting processing input.")

    validate_df(feature_ranks, "feature ranks", 2, 1)
    validate_df(sample_metadata, "sample metadata", 1, 1)
    if feature_metadata is not None:
        # It's cool if there aren't any features actually described in the
        # feature metadata (hence why we pass in 0 as the minimum # of rows in
        # the feature metadata DataFrame), but we still pass it to
        # validate_df() in order to ensure that:
        #   1) there's at least one feature metadata column (because
        #      otherwise the feature metadata is useless)
        #   2) column names are unique
        validate_df(feature_metadata, "feature metadata", 0, 1)

    # Replace NaN values (which both _metadata_utils.read_metadata_file() and
    # qiime2.Metadata use to represent missing values, i.e. ""s) with None --
    # this is generally easier for us to handle in the JS side of things (since
    # it'll just be consistently converted to null by json.dumps()).
    sample_metadata = replace_nan(sample_metadata)
    if feature_metadata is not None:
        feature_metadata = replace_nan(feature_metadata)

    # NOTE although we always call filter_unextreme_features(), no filtering is
    # necessarily done (depending on the value of extreme_feature_count and the
    # contents of the table/ranks).
    filtered_table, filtered_ranks = filter_unextreme_features(
        biom_table, feature_ranks, extreme_feature_count
    )
    logging.debug("Creating a SparseDataFrame from the BIOM table.")

    # Old versions of BIOM accidentally produce an effectively-dense DataFrame
    # when using biom.Table.to_dataframe() (see
    # https://github.com/biocore/biom-format/issues/808). To get around this,
    # we extract the scipy.sparse.csr_matrix data from the BIOM table and
    # directly convert that to a pandas SparseDataFrame.
    sparse_matrix_data = filtered_table.matrix_data
    table = pd.SparseDataFrame(sparse_matrix_data, default_fill_value=0.0)

    # The csr_matrix doesn't include column/index IDs, so we manually add them
    # in to the SparseDataFrame.
    table.index = filtered_table.ids(axis="observation")
    table.columns = filtered_table.ids(axis="sample")

    # Validate the table DataFrame -- should be ok since we loaded this through
    # the biom module, but might as well check
    validate_df(table, "BIOM table", 2, 1)

    logging.debug("Converted BIOM table to SparseDataFrame.")

    # Match features to BIOM table, and then match samples to BIOM table.
    # This should bring us to a point where every feature/sample is
    # supported in the BIOM table. (Note that the input BIOM table might
    # contain features or samples that are not included in filtered_ranks or
    # sample_metadata, respectively -- this is totally fine. The opposite,
    # though, is a big no-no.)
    table, V = matchdf(table, filtered_ranks)
    logging.debug("Matching table with feature ranks done.")
    # Ensure that every ranked feature was present in the BIOM table. Raise an
    # error if this isn't the case.
    if V.shape[0] != filtered_ranks.shape[0]:
        unsupported_feature_ct = filtered_ranks.shape[0] - V.shape[0]
        # making this error message as pretty as possible
        word = "were"
        if unsupported_feature_ct == 1:
            word = "was"
        raise ValueError(
            "Of the {} ranked features, {} {} not present in "
            "the input BIOM table.".format(
                filtered_ranks.shape[0], unsupported_feature_ct, word
            )
        )

    table, U = matchdf(table.T, sample_metadata)
    logging.debug("Matching table with sample metadata done.")
    # Allow for dropped samples (e.g. negative controls), but ensure that at
    # least one sample is supported by the BIOM table.
    if U.shape[0] < 1:
        raise ValueError(
            "None of the samples in the sample metadata file "
            "are present in the input BIOM table."
        )

    dropped_sample_ct = sample_metadata.index.difference(U.index).shape[0]
    if dropped_sample_ct > 0:
        print(
            "NOTE: {} sample(s) in the sample metadata file were not "
            "present in the BIOM table, and have been removed from the "
            "visualization.".format(dropped_sample_ct)
        )

    # Now that we've matched up the BIOM table with the feature ranks and
    # sample metadata, we're almost done.

    # Before we go through feature metadata: convert all rank column IDs
    # to strings (since Altair gets angry if you pass in ints as column IDs),
    # and (as a temporary fix for #66) call fix_id() on these column IDs via
    # escape_columns(). (escape_columns() will also check to make sure that the
    # column names stay unique after calling fix_id().)
    filtered_ranks.columns = [str(c) for c in filtered_ranks.columns]
    filtered_ranks = escape_columns(filtered_ranks)

    ranking_ids = filtered_ranks.columns

    feature_metadata_cols = []
    # If the user passed in feature metadata corresponding to taxonomy
    # information, then we use that to update the feature data to include
    # that metadata. Feature metadata will be represented as additional fields
    # for each feature in the rank plot. (This can help out in the searching
    # part of the visualization, but it isn't necessary.)
    if feature_metadata is not None:
        try:
            feature_metadata_cols = feature_metadata.columns
            # Use of suffixes=(False, False) ensures that columns are unique
            # between feature metadata and feature ranks.
            filtered_ranks = filtered_ranks.merge(
                feature_metadata,
                how="left",
                left_index=True,
                right_index=True,
                suffixes=(False, False),
            )
        except ValueError:
            # It might be possible to figure out a way to handle this sort of
            # situation automatically, but unless it becomes a problem I'm ok
            # with the current solution.
            print(
                "Column names for the feature metadata and feature ranks "
                "should be distinct. Try creating a copy of your feature "
                "metadata with identical columns renamed, and use that with "
                "Qurro."
            )
            raise

    logging.debug("Finished input processing.")
    return U, filtered_ranks, ranking_ids, feature_metadata_cols, table


def gen_rank_plot(V, ranking_ids, feature_metadata_cols):
    """Generates altair.Chart object describing the rank plot.

    Arguments:

    V: pd.DataFrame
        feature ranks

    ranking_ids: pd.Index
        IDs of the actual "ranking" columns in V (since V can include
        feature metadata)

    feature_metadata_cols: pd.Index or list
        IDs of the feature metadata columns in V (if no such IDs present, an
        empty list should be passed)

    Returns:

    JSON describing a Vega-Lite specification for the rank plot.
    """

    rank_data = V.copy()

    # NOTE that until this point we've treated the actual rank values as just
    # "objects", as far as pandas is concerned. However, if we continue to
    # treat them as objects when sorting them, we'll get a list of feature
    # ranks in lexicographic order... which is not what we want. So we just
    # ensure that all of the columns contain numeric data.
    for col in ranking_ids:
        rank_data[col] = pd.to_numeric(rank_data[col])

    # The default rank column is just whatever the first rank is. This is what
    # the rank plot will use when it's first drawn.
    default_rank_col = ranking_ids[0]

    # Set default classification of every feature to "None"
    # (This value will be updated when a feature is selected in the rank plot
    # as part of the numerator, denominator, or both parts of the current log
    # ratio.)
    rank_data["Classification"] = "None"

    # Replace "index" with "Feature ID". looks nicer in the visualization :)
    rank_data.rename_axis("Feature ID", axis="index", inplace=True)
    rank_data.reset_index(inplace=True)

    # Now, we can actually create the rank plot.
    rank_chart = (
        alt.Chart(
            rank_data,
            title="Feature Ranks",
            background="#FFFFFF",
            autosize=alt.AutoSizeParams(resize=True),
        )
        .mark_bar()
        .transform_window(
            sort=[alt.SortField(field=default_rank_col, order="ascending")],
            # We don't use an alt.WindowFieldDef here because python gets
            # confused when you use "as" as an actual argument name. So we just
            # use this syntax.
            window=[{"op": "row_number", "as": "qurro_x"}],
        )
        .encode(
            # type="ordinal" needed on the scale here to make bars adjacent;
            # see https://stackoverflow.com/a/55544817/10730311.
            x=alt.X(
                "qurro_x",
                title="Sorted Features",
                type="ordinal",
                scale=alt.Scale(paddingOuter=1, paddingInner=0, rangeStep=1),
                axis=alt.Axis(ticks=False, labelAngle=0),
            ),
            y=alt.Y(default_rank_col, type="quantitative"),
            color=alt.Color(
                "Classification",
                scale=alt.Scale(
                    domain=["None", "Numerator", "Denominator", "Both"],
                    range=["#e0e0e0", "#f00", "#00f", "#949"],
                ),
            ),
            tooltip=[
                alt.Tooltip(
                    field="qurro_x",
                    title="Current Ranking",
                    type="quantitative",
                ),
                "Classification",
                "Feature ID",
                *feature_metadata_cols,
            ],
        )
        .configure_axis(
            # Done in order to differentiate "None"-classification features
            # from grid lines
            gridColor="#f2f2f2",
            labelBound=True,
        )
        .interactive()
    )

    rank_chart_json = rank_chart.to_dict()
    rank_ordering = "qurro_rank_ordering"
    fm_col_ordering = "qurro_feature_metadata_ordering"
    # Note we don't use rank_data.columns for setting the rank ordering. This
    # is because rank_data's columns now include both the ranking IDs and the
    # "Feature ID" and "Classification" columns (as well as any feature
    # metadata the user saw fit to pass in).
    rank_chart_json["datasets"][rank_ordering] = list(ranking_ids)
    rank_chart_json["datasets"][fm_col_ordering] = list(feature_metadata_cols)
    return rank_chart_json


def gen_sample_plot(table, metadata):
    """Generates altair.Chart object describing the sample scatterplot.

    Arguments:

    table: pandas DataFrame describing feature abundances for each sample.
    metadata: pandas DataFrame describing metadata for each sample.

    Returns:

    JSON describing altair.Chart for the sample plot.
    """

    # Used to set color
    default_metadata_col = metadata.columns[0]

    # Since we don't bother setting a default log ratio, we set the balance for
    # every sample to NaN so that Altair will filter them out (producing an
    # empty scatterplot by default, which makes sense). I guess None would
    # also work here.
    # TODO just make a new column in a vectorized operation, no need to merge
    balance = pd.Series(index=table.index).fillna(float("nan"))
    df_balance = pd.DataFrame({"qurro_balance": balance})
    # At this point, df_balance is a DataFrame with its index as sample IDs
    # and one column ("qurro_balance", which is solely NaNs).
    # We know that df_balance and metadata's indices should match up since we
    # already ran matchdf() on the loaded BIOM table and metadata.
    # (Use of (False, False) means that if metadata contains a column called
    # rankratiovz_balance, this will throw an error.)
    sample_metadata = pd.merge(
        df_balance,
        metadata,
        left_index=True,
        right_index=True,
        suffixes=(False, False),
    )

    # "Reset the index" -- make the sample IDs a column (on the leftmost side)
    # First we rename the index "Sample ID", just on the off chance that
    # there's a metadata column called "index".
    # NOTE that there shouldn't be a metadata column called Sample ID or
    # something like that, since that should've been used in the merge with
    # df_balance above (and "Sample ID" follows the Q2 metadata conventions for
    # an "Identifier Column" name).
    sample_metadata.rename_axis("Sample ID", axis="index", inplace=True)
    sample_metadata.reset_index(inplace=True)

    # Very minor thing -- sort the samples by their IDs. This should ensure
    # that the sample plot output is deterministic -- and, therefore, when
    # running qurro._json_utils to see if we need to update the specs in
    # the JS, qurro._json_utils.jsons_equal() should be True unless we actually
    # change something in the actual JSON details.
    sample_metadata.sort_values(by=["Sample ID"], inplace=True)

    # Create sample plot chart Vega-Lite spec using Altair.
    sample_chart = (
        alt.Chart(
            sample_metadata,
            title="Log Ratio of Abundances in Samples",
            background="#FFFFFF",
            autosize=alt.AutoSizeParams(resize=True),
        )
        .mark_circle()
        .encode(
            alt.X(
                default_metadata_col,
                type="nominal",
                axis=alt.Axis(labelAngle=-45),
            ),
            alt.Y(
                "qurro_balance",
                title="log(Numerator / Denominator)",
                type="quantitative",
            ),
            color=alt.Color(default_metadata_col, type="nominal"),
            tooltip=["Sample ID", "qurro_balance"],
        )
        .configure_axis(labelBound=True)
        .interactive()
    )

    # Replace the "mark": "circle" definition with a more explicit one. This
    # will be useful when adding attributes to the boxplot mark in the
    # visualization. (We have to resort to this hack because I haven't been
    # able to successfully use alt.MarkDef in the alt.Chart definition above.)
    sample_chart_dict = sample_chart.to_dict()
    sample_chart_dict["mark"] = {"type": "circle"}
    # Return the JSONs as dicts for 1) the sample plot JSON (which only
    # contains sample metadata), and 2) the feature counts per sample (which
    # will be stored separately from the sample plot JSON in order to not hit
    # performance too terribly).
    return sample_chart_dict, table.to_dict()


def gen_visualization(
    V,
    ranking_ids,
    feature_metadata_cols,
    processed_table,
    df_sample_metadata,
    output_dir,
):
    """Creates a Qurro visualization. This function should be callable
       from both the QIIME 2 and standalone Qurro scripts.

       Returns:

       index_path: a path to the index.html file for the output visualization.
                   This is needed when calling q2templates.render().
    """

    # https://altair-viz.github.io/user_guide/faq.html#disabling-maxrows
    alt.data_transformers.enable("default", max_rows=None)

    logging.debug("Generating rank plot JSON.")
    rank_plot_json = gen_rank_plot(V, ranking_ids, feature_metadata_cols)
    logging.debug("Generating sample plot JSON.")
    sample_plot_json, count_json = gen_sample_plot(
        processed_table, df_sample_metadata
    )
    logging.debug("Finished generating both plots.")
    os.makedirs(output_dir, exist_ok=True)
    # copy files for the visualization
    loc_ = os.path.dirname(os.path.realpath(__file__))
    # NOTE: We can just join loc_ with support_files/, since support_files/ is
    # located within the same directory as generate.py. Previously (when this
    # code was contained in q2/_method.py and scripts/_plot.py), I joined loc_
    # with .. and then with support_files since we had to first navigate up to
    # the directory containing generate.py and support_files/. Now, we don't
    # have to do that any more.
    support_files_loc = os.path.join(loc_, "support_files")
    index_path = None
    for file_ in os.listdir(support_files_loc):
        if file_ != ".DS_Store":
            copy_func = copyfile
            # If we hit a directory in support_files/, just copy the entire
            # directory to our destination using shutil.copytree()
            if os.path.isdir(os.path.join(support_files_loc, file_)):
                copy_func = copytree
            copy_func(
                os.path.join(support_files_loc, file_),
                os.path.join(output_dir, file_),
            )
        if file_ == "index.html":
            index_path = os.path.join(output_dir, file_)

    if index_path is None:
        # This should never happen -- assuming Qurro has been installed
        # fully, i.e. with a complete set of support_files/ -- but we handle it
        # here just in case.
        raise FileNotFoundError("Couldn't find index.html in support_files/")

    # create JS code that loads these JSON files in main.js
    main_loc = os.path.join(support_files_loc, "main.js")
    output_loc = os.path.join(output_dir, "main.js")
    exit_code = replace_js_json_definitions(
        main_loc,
        rank_plot_json,
        sample_plot_json,
        count_json,
        output_file_loc=output_loc,
    )
    if exit_code != 0:
        raise ValueError("Wasn't able to replace JSONs and write to main.js.")

    logging.debug("Finished writing the visualization contents.")

    return index_path
