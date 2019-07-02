#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

import logging
import biom
import skbio
import pandas as pd
from qurro._df_utils import escape_columns


def read_rank_file(file_loc):
    """Converts an input file of ranks to a DataFrame."""

    if file_loc.endswith(".tsv"):
        rank_df = differentials_to_df(file_loc)
    else:
        # ordination_to_df() will raise an appropriate error if it can't
        # process this file.
        rank_df = ordination_to_df(file_loc)

    return escape_columns(rank_df)


def rename_loadings(loadings_df):
    """Renames a DataFrame of loadings to say "Axis 1", "Axis 2", etc.

       This should match what Emperor does in its visualizations.
    """

    loadings_df_copy = loadings_df.copy()
    new_column_names = []
    for n in range(1, len(loadings_df_copy.columns) + 1):
        new_column_names.append("Axis {}".format(n))
    loadings_df_copy.columns = new_column_names
    return loadings_df_copy


def ordination_to_df(ordination_file_loc):
    """Returns a DataFrame of feature loadings from a skbio ordination file."""

    # If this fails, it raises an skbio.io.UnrecognizedFormatError.
    ordination = skbio.OrdinationResults.read(ordination_file_loc)

    return rename_loadings(ordination.features)


def differentials_to_df(differentials_loc):
    """Converts a differential rank TSV file to a DataFrame."""

    differentials = pd.read_csv(
        differentials_loc, sep="\t", na_filter=False, dtype=object
    )
    # Delay setting index column so we can first load it as an object (this
    # saves us from situations where the index col would otherwise be read as a
    # number or something that would mess things up -- read_metadata_file()
    # does the same sorta thing)
    differentials.set_index(differentials.columns[0], inplace=True)
    # Also, we don't bother naming the differentials index (yet). This is
    # actually needed to make some of the tests pass (which is dumb, I know,
    # but if I pass check_names=False to assert_frame_equal then the test
    # doesn't check column names, and I want it to do that...)
    differentials.index.rename(None, inplace=True)

    # This is slow but it should at least *work as intended.*
    # If there are any non-numeric differentials, or any NaN differentials, or
    # any infinity/-infinity differentials (???), then we should raise an
    # error. This code should do that.
    for feature_row in differentials.itertuples():
        for differential in feature_row[1:]:
            try:
                fd = float(differential)
                if pd.isna(fd) or fd == float("inf") or fd == float("-inf"):
                    raise ValueError
            except ValueError:
                raise ValueError(
                    "Missing / nonnumeric differential(s) found for feature "
                    "{}".format(feature_row[0])
                )

    # Now, we should be able to do this freely.
    for column in differentials.columns:
        differentials[column] = differentials[column].astype(float)
    return differentials


def filter_unextreme_features(
    table: biom.Table,
    ranks: pd.DataFrame,
    extreme_feature_count: int,
    print_warning: bool = True,
) -> None:
    """Returns copies of the table and ranks with "unextreme" features removed.

       Parameters
       ----------

       table: biom.Table
            A BIOM table for the dataset.
            This checks to make sure that the remaining "extreme" features are
            all in the table -- if not, then this throws a ValueError.

       ranks: pandas.DataFrame
            A DataFrame where the index consists of ranked features' IDs, and
            the columns correspond to the various ranking(s) for which each
            feature should have a numeric value.

       extreme_feature_count: int
            An integer representing the number of features from each "end" of
            the feature rankings to preserve in the table. If this is None, the
            input table and ranks will just be returned.
            This has to be at least 1.

       print_warning: bool
            If True, this will print out a warning if (extreme_feature_count *
            2) >= the number of ranked features. (This can be disabled for
            tests, etc.)

       Returns
       -------

       (table, ranks): (biom.Table, pandas.DataFrame)
            Filtered copies of the input BIOM table and feature ranking DF.

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

       If (extreme_feature_count * 2) is greater than or equal to the total
       number of features in the ranks DataFrame, this won't do any filtering
       at all. In this case, a warning message will be printed from this
       function, and the given table and ranks inputs will be returned.
    """

    logging.debug('Starting to filter "unextreme" features.')

    if extreme_feature_count is None:
        logging.debug("No extreme feature count specified; not filtering.")
        return table, ranks
    elif extreme_feature_count < 1:
        raise ValueError("Extreme feature count must be at least 1.")
    elif type(extreme_feature_count) != int:
        raise ValueError("Extreme feature count must be an integer.")

    efc2 = extreme_feature_count * 2
    if efc2 >= len(ranks):
        logging.debug("Extreme Feature Count too large to do any filtering.")
        if print_warning:
            print(
                "The input Extreme Feature Count was {}. {} * 2 = {}.".format(
                    extreme_feature_count, extreme_feature_count, efc2
                )
            )
            print(
                "{} is greater than or equal to the number of ranked "
                "features ({}).".format(efc2, len(ranks))
            )
            print("Therefore, no feature filtering will be done now.")
        return table, ranks

    # OK, we're actually going to do some filtering.
    logging.debug(
        "Will perform filtering with e.f.c. of {}.".format(
            extreme_feature_count
        )
    )
    logging.debug("Input table has shape {}.".format(table.shape))
    logging.debug("Input feature ranks have shape {}.".format(ranks.shape))

    # We store these features in a set to avoid duplicates -- Python does the
    # hard work here for us
    features_to_preserve = set()
    for ranking in ranks.columns:
        upper_extrema = ranks.nlargest(extreme_feature_count, ranking).index
        lower_extrema = ranks.nsmallest(extreme_feature_count, ranking).index
        features_to_preserve |= set(upper_extrema)
        features_to_preserve |= set(lower_extrema)

    # Also filter ranks. Fortunately, DataFrame.filter() makes this easy.
    filtered_ranks = ranks.filter(items=features_to_preserve, axis="index")

    # Filter the BIOM table to desired features.
    def filter_biom_table(values, feature_id, _):
        return feature_id in features_to_preserve

    filtered_table = table.filter(
        filter_biom_table, axis="observation", inplace=False
    )

    # Since Qurro filters unextreme features before matching the table with the
    # feature ranks, there's the possibility that all of the features that we
    # filtered the table to are not actually *present* in the table. So we need
    # to quickly verify that the table contains all of the "extreme" features.
    table_feature_ct = filtered_table.shape[0]
    ranks_feature_ct = len(filtered_ranks.index)
    if table_feature_ct < ranks_feature_ct:
        raise ValueError(
            '{} "extreme" ranked feature(s) were not present in '
            "the input BIOM table.".format(ranks_feature_ct - table_feature_ct)
        )

    logging.debug("Output table has shape {}.".format(filtered_table.shape))
    logging.debug(
        "Output feature ranks have shape {}.".format(filtered_ranks.shape)
    )
    logging.debug("Done with filtering unextreme features.")

    return filtered_table, filtered_ranks
