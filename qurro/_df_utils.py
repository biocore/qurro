#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

import logging
import pandas as pd


def matchdf(df1, df2):
    """Filters both DataFrames to just the rows of their shared indices.

       Derived from gneiss.util.match() (https://github.com/biocore/gneiss).
    """

    idx = set(df1.index) & set(df2.index)
    return df1.loc[idx], df2.loc[idx]


def ensure_df_headers_unique(df, df_name):
    """Raises an error if the index or columns of the DataFrame aren't unique.

       (If both index and columns are non-unique, the index error will take
       precedence.)

       If these fields are unique, no errors are raised and nothing (None) is
       implicitly returned.

       Parameters
       ----------

       df: pandas.DataFrame
       df_name: str
           The "name" of the DataFrame -- this is displayed to the user in the
           error message thrown if the DataFrame has any non-unique IDs.
    """
    if len(df.index.unique()) != df.shape[0]:
        raise ValueError(
            "Indices of the {} DataFrame are not" " unique.".format(df_name)
        )

    if len(df.columns.unique()) != df.shape[1]:
        raise ValueError(
            "Columns of the {} DataFrame are not" " unique.".format(df_name)
        )


def validate_df(df, name, min_row_ct, min_col_ct):
    """Does some basic validation on the DataFrame.

       1. Calls ensure_df_headers_unique() to ensure that index and column
          names are unique.
       2. Checks that the DataFrame has at least min_row_ct rows.
       3. Checks that the DataFrame has at least min_col_ct columns.
    """
    ensure_df_headers_unique(df, name)
    logging.debug("Ensured uniqueness of {}.".format(name))
    if df.shape[0] < min_row_ct:
        raise ValueError(
            "Less than {} rows found in the {}.".format(min_row_ct, name)
        )
    if df.shape[1] < min_col_ct:
        raise ValueError(
            "Less than {} columns found in the {}.".format(min_col_ct, name)
        )


def fix_id(fid):
    """As a temporary measure, escapes certain special characters in a name.

       Right now, a measure like this is required to make Vega* work properly
       with various field names.

       See https://github.com/vega/vega-lite/issues/4965.
    """

    new_id = ""
    for c in fid:
        if c == ".":
            new_id += ":"
        elif c == "]":
            new_id += ")"
        elif c == "[":
            new_id += "("
        elif c == "'" or c == '"' or c == "\\":
            new_id += "|"
        else:
            new_id += c
    return new_id


def escape_columns(df):
    """Calls str() then fix_id() on each of the column names of the DF."""
    new_cols = []
    for col in df.columns:
        new_cols.append(fix_id(str(col)))
    df.columns = new_cols
    # Ensure that this didn't make the column names non-unique
    ensure_df_headers_unique(df, "escape_columns() DataFrame")
    return df


def replace_nan(df, new_nan_val=None):
    """Replaces all occurrences of NaN values in the DataFrame with a specified
       value.

       Note that this solution seems to result in the DataFrame's columns'
       dtypes being changed to object. (This shouldn't change much due to how
       we handle metadata files, though.)

       Based on the solution described here:
       https://stackoverflow.com/a/14163209/10730311
    """
    return df.where(df.notna(), new_nan_val)


def biom_table_to_sparse_df(table, min_row_ct=2, min_col_ct=1):
    """Loads a BIOM table as a pd.SparseDataFrame. Also calls validate_df().

       We need to use a helper function for this because old versions of BIOM
       accidentally produce an effectively-dense DataFrame when using
       biom.Table.to_dataframe() -- see
       https://github.com/biocore/biom-format/issues/808.

       To get around this, we extract the scipy.sparse.csr_matrix data from the
       BIOM table and directly convert that to a pandas SparseDataFrame.
    """
    logging.debug("Creating a SparseDataFrame from BIOM table.")
    table_sdf = pd.SparseDataFrame(table.matrix_data, default_fill_value=0.0)

    # The csr_matrix doesn't include column/index IDs, so we manually add them
    # in to the SparseDataFrame.
    table_sdf.index = table.ids(axis="observation")
    table_sdf.columns = table.ids(axis="sample")

    # Validate the table DataFrame -- should be ok since we loaded this through
    # the biom module, but might as well check
    validate_df(table_sdf, "BIOM table", 2, 1)

    logging.debug("Converted BIOM table to SparseDataFrame.")
    return table_sdf


def remove_empty_samples(table_sdf, sample_metadata_df):
    """Removes samples with 0 counts for every feature from the table and
       sample metadata DataFrame.

       This should be called *after* matching the table with the sample
       metadata -- we assume that the columns of the table DataFrame are
       equivalent to the indices of the sample metadata DataFrame.

       This will raise a ValueError if, after removing empty samples, either
       the table's columns or the metadata's indices are empty (this will
       happen in the case where all of the samples in these DataFrames are
       empty).
    """
    logging.debug("Attempting to remove empty samples.")
    table_df_equal_to_zero = table_sdf == 0
    nonempty_samples = []
    for sample in table_sdf.columns:
        if not table_df_equal_to_zero[sample].all():
            nonempty_samples.append(sample)

    filtered_table = table_sdf.filter(items=nonempty_samples, axis="columns")
    filtered_metadata = sample_metadata_df.filter(
        items=nonempty_samples, axis="index"
    )

    if len(filtered_table.columns) < 1 or len(filtered_metadata.index) < 1:
        raise ValueError("Found all empty samples with current features.")

    sample_diff = len(table_sdf.columns) - len(filtered_table.columns)
    if sample_diff > 0:
        logging.debug("Removed {} empty sample(s).".format(sample_diff))
    else:
        logging.debug("Couldn't find any empty samples.")

    return filtered_table, filtered_metadata


def match_table_and_data(table, feature_ranks, sample_metadata):
    """Matches feature rankings and then sample metadata to a table.

       Parameters
       ----------

       table: pd.DataFrame (or pd.SparseDataFrame)
            A DataFrame created from a BIOM table. The index of this DataFrame
            should correspond to observations (i.e. features), and the columns
            should correspond to samples.

       feature_ranks: pd.DataFrame
            A DataFrame describing features' "ranks" along ranking(s). The
            index of this DataFrame should correspond to feature IDs, and the
            columns should correspond to different rankings' names.

       sample_metadata: pd.DataFrame
            A DataFrame describing sample metadata. The index of this DataFrame
            should describe sample IDs, and the columns should correspond to
            different sample metadata fields' names.

       Returns
       -------

       (m_table, m_sample_metadata): both pd.[Sparse]DataFrame
            Versions of the input table and sample metadata only containing
            samples shared by both datasets. The table will also only contain
            features shared by both the table and the feature ranks.

            (None of the features in the feature ranks should be dropped during
            this operation, so we don't bother returning the feature ranks
            DataFrame.)

       Raises
       ------

       If any of the features described in feature_ranks are not present in
       the table, this will raise a ValueError.

       If all of the samples described in sample_metadata are not present
       in the table, this will raise a ValueError.
    """
    logging.debug("Starting matching table with feature/sample data.")
    # Match features to BIOM table, and then match samples to BIOM table.
    # This should bring us to a point where every feature/sample is
    # supported in the BIOM table. (Note that the input BIOM table might
    # contain features or samples that are not included in feature_ranks or
    # sample_metadata, respectively -- this is totally fine. The opposite,
    # though, is a big no-no.)
    featurefiltered_table, m_feature_ranks = matchdf(table, feature_ranks)
    logging.debug("Matching table with feature ranks done.")
    # Ensure that every ranked feature was present in the BIOM table. Raise an
    # error if this isn't the case.
    if m_feature_ranks.shape[0] < feature_ranks.shape[0]:
        unsupported_feature_ct = (
            feature_ranks.shape[0] - m_feature_ranks.shape[0]
        )
        # making this error message as pretty as possible
        word = "were"
        if unsupported_feature_ct == 1:
            word = "was"
        raise ValueError(
            "Of the {} ranked features, {} {} not present in "
            "the input BIOM table.".format(
                feature_ranks.shape[0], unsupported_feature_ct, word
            )
        )

    m_table_transpose, m_sample_metadata = matchdf(
        featurefiltered_table.T, sample_metadata
    )
    logging.debug("Matching table with sample metadata done.")
    # Allow for dropped samples (e.g. negative controls), but ensure that at
    # least one sample is supported by the BIOM table.
    if m_sample_metadata.shape[0] < 1:
        raise ValueError(
            "None of the samples in the sample metadata file "
            "are present in the input BIOM table."
        )

    dropped_sample_ct = sample_metadata.shape[0] - m_sample_metadata.shape[0]
    if dropped_sample_ct > 0:
        print(
            "NOTE: {} sample(s) in the sample metadata file were not "
            "present in the BIOM table, and have been removed from the "
            "visualization.".format(dropped_sample_ct)
        )
    # We return the transpose of the transposed table, so the table should have
    # the same "orientation" (i.e. columns are samples, rows (indices) are
    # features) as the input table.
    return m_table_transpose.T, m_sample_metadata


def merge_feature_metadata(feature_ranks, feature_metadata=None):
    """Attempts to merge feature metadata into a feature ranks DataFrame.

       Parameters
       ----------

       feature_ranks: pd.DataFrame
            A DataFrame defining feature rankings, where the index corresponds
            to feature IDs and the columns correspond to ranking names.

       feature_metadata: pd.DataFrame or None
            A DataFrame defining feature metadata, where the index corresponds
            to feature IDs and the columns correspond to feature metadata
            names. It isn't expected that every feature ID be passed.

       Returns
       -------

       (output_feature_data, feature_metadata_cols): (pd.DataFrame, list)
            The input feature ranks DataFrame, with any available feature
            metadata merged in; and a list of any columns in the feature
            metadata (or [] if the feature metadata was None).

       Raises
       ------

       ValueError: if column name(s) are shared between the feature ranks and
                   feature metadata DataFrames. See #55 for context.
    """
    # If the user passed in feature metadata corresponding to taxonomy
    # information, then we use that to update the feature data to include
    # that metadata. Feature metadata will be represented as additional fields
    # for each feature in the rank plot. (This can help out in the searching
    # part of the visualization, but it isn't necessary.)
    feature_metadata_cols = []
    if feature_metadata is not None:
        try:
            feature_metadata_cols = feature_metadata.columns
            # Use of suffixes=(False, False) ensures that columns are unique
            # between feature metadata and feature ranks.
            output_feature_data = feature_ranks.merge(
                feature_metadata,
                how="left",
                left_index=True,
                right_index=True,
                suffixes=(False, False),
            )
        except ValueError:
            # It might be possible to figure out a way to handle this sort of
            # situation automatically, but unless it becomes a problem I'm ok
            # with the current solution. See github.com/fedarko/qurro/issues/55
            print(
                "Column names for the feature metadata and feature ranks "
                "should be distinct. Try creating a copy of your feature "
                "metadata with identical columns renamed, and use that with "
                "Qurro."
            )
            raise
    else:
        output_feature_data = feature_ranks

    return output_feature_data, feature_metadata_cols
