#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

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

    differentials = pd.read_csv(differentials_loc, sep='\t', index_col=0)
    return differentials
