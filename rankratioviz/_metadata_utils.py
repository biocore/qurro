#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

import pandas as pd


def read_metadata_file(md_file_loc):
    """Reads in a metadata file using pandas.read_csv().

       One slightly strange thing is that pandas.read_csv() interprets
       columns containing all values of True / False as booleans. This
       causes problems down the line, since these values are converted to
       true / false (note the lowercase) when using them in JavaScript.

       To ensure consistency with QIIME 2's metadata guidelines (which only
       consider numeric and categorical types), we convert all values in
       columns labelled with the bool type to strings. This preserves the
       "case" of True / False, and should result in predictable outcomes.
    """
    metadata_df = pd.read_csv(md_file_loc, index_col=0, sep="\t")

    bool_cols = metadata_df.select_dtypes(include=[bool]).columns
    if len(bool_cols) > 0:
        type_conv_dict = {col: str for col in bool_cols}
        metadata_df = metadata_df.astype(type_conv_dict)

    return metadata_df


def read_gnps_feature_metadata_file(md_file_loc):
    """Reads in a GNPS feature metadata file, producing a sane DataFrame."""
    # Note that we don't set index_col = 0 -- the columns we care about
    # ("parent mass", "RTConsensus", and "LibraryID"), as far as I know, don't
    # have a set position. So we'll just use the basic RangeIndex that pandas
    # defaults to.
    metadata_df = pd.read_csv(md_file_loc, sep="\t")
    # Create a feature ID column from the parent mass and RTConsensus cols.
    metadata_df["rankratioviz_feature_id"] = (
        metadata_df["parent mass"].astype(str)
        + ";"
        + metadata_df["RTConsensus"].astype(str)
    )
    # Set the feature ID column as the actual index of the DataFrame. If there
    # are any duplicates (due to two features having the same mass-to-charge
    # ratio and discharge time), our use of verify_integrity here will raise
    # an error accordingly. (That probably won't happen, but best to be safe.)
    metadata_df = metadata_df.set_index(
        "rankratioviz_feature_id", verify_integrity=True
    )
    # Remove all the feature metadata that we don't care about (now, at least).
    # metadata_df now only contains the feature ID we constructed and the
    # Library ID, so it's ready to be used to annotate feature IDs (after those
    # IDs' numbers have been truncated).
    metadata_df = metadata_df.filter(items=["LibraryID"])
    return metadata_df
