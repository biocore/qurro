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


def read_rank_file(file_loc):
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
    table: biom.Table,
    ranks: pd.DataFrame,
    extreme_feature_count: int,
    print_warning: bool = True,
) -> None:
    """Returns copies of the table and ranks with "unextreme" features removed.

       Also removes samples from the table that, after removing "unextreme"
       features, don't contain any of the remaining features.

       Parameters
       ----------

       table: biom.Table
            An ordinary BIOM table.

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
            Filtered copies of the input BIOM table and ranks DataFrame.

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
       at all. (It won't even filter out empty samples, in the case that the
       input table already contained empty samples.) In this case, a warning
       message will be printed from this function, and the given table and
       ranks inputs will be returned.
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

    logging.debug(
        "Will perform filtering with e.f.c. of {}.".format(
            extreme_feature_count
        )
    )
    logging.debug("Input table has shape {}.".format(table.shape))
    logging.debug("Input feature ranks have shape {}.".format(ranks.shape))
    # OK, we're actually going to do some filtering.
    filtered_table = table.copy()
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

    filtered_table.filter(filter_biom_table, axis="observation")

    # Finally, filter now-empty samples from the BIOM table.
    filtered_table.remove_empty(axis="sample")

    logging.debug("Output table has shape {}.".format(filtered_table.shape))
    logging.debug(
        "Output feature ranks have shape {}.".format(filtered_ranks.shape)
    )
    logging.debug("Done with filtering.")

    return filtered_table, filtered_ranks
