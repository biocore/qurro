#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

import biom
import skbio
import pandas as pd


def rank_file_to_df(file_loc):
    """Converts an input file of ranks to a DataFrame."""

    if file_loc.endswith(".tsv"):
        return differentials_to_df(file_loc)
    else:
        # ordination_to_df() will raise an appropriate error if it can't
        # process this file.
        return ordination_to_df(file_loc)


def ordination_to_df(ordination_file_loc):
    """Converts an ordination.txt file to a DataFrame of its feature ranks."""

    # If this fails, it raises an skbio.io.UnrecognizedFormatError.
    ordination = skbio.OrdinationResults.read(ordination_file_loc)
    return ordination.features


def differentials_to_df(differentials_loc):
    """Converts a differential rank TSV file to a DataFrame."""

    differentials = pd.read_csv(differentials_loc, sep="\t", index_col=0)
    return differentials


def filter_unextreme_features(
    table: biom.Table, ranks_df: pd.DataFrame, extreme_feature_count: int
) -> None:
    """Returns a copy of the input table with "unextreme" features removed.

       Also removes samples from the table that, after removing "unextreme"
       features, don't contain any of the remaining features.

       Parameters
       ----------

       table: biom.Table
            An ordinary BIOM table.

       ranks_df: pandas.DataFrame
            A DataFrame where the index consists of ranked features' IDs, and
            the columns correspond to the various ranking(s) for which each
            feature should have a numeric value.

       extreme_feature_count: int
            An integer representing the number of features from each "end" of
            the feature rankings to preserve in the table.

       Behavior
       --------

       As an example of how this function works:

       If extreme_feature_count is equal to 3, and if there are 5 "rankings"
       (i.e. non-feature-ID columns) in the ranks DataFrame, then somewhere
       in the inclusive range of 6 to 30 features will be preserved.

       The 3 * 2 = 6 extreme features of the first ranking will be identified,
       and then extrema will be identified for the remaining four rankings. If
       all of the extreme features are the same between rankings, then only the
       six extrema will be preserved; however, if all of the rankings have
       distinct extrema, then each of the 5 rankings will have 6 extreme
       features preserved, making a total of (3 * 2) * 5 = 30 features.

       If (extreme_feature_count * 2) is less than or equal to the total number
       of features in the ranks DataFrame, this won't do any filtering at all.
       (It won't even filter out empty samples, in the case that the input
       table already contained empty samples.)
    """
