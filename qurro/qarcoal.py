#!/usr/bin/env python3
# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
#
# Generates table of sample-level Numerator:Denominator log-ratios.
# ----------------------------------------------------------------------------

import biom
import numpy as np
import pandas as pd
from qiime2 import Metadata

def qarcoal(table: biom.Table,
            num_string: str, 
            denom_string: str,
            taxonomy: Metadata) -> pd.DataFrame:
    """Calculate sample-wise log-ratios of features with
    num_string in numerator over denom_string in denominator.

    Parameters:
    -----------
        table: biom file with which to calculate log ratios
        taxonomy: Qiime2 compliant feature taxonomy metadata file
        num_string: numerator string to search for in taxonomy
        denom_string: denominator string to search for in taxonomy

    Returns:
    --------
        comparison_df: pd DataFrame in the form:

            Sample-ID    Num_Sum    Denom_Sum   log_ratio
                   S1          7           15   -0.762140
    """

    # biom table is features x samples
    feat_table = table.to_dataframe()
    samples = list(feat_table.columns)
    taxonomy_df = taxonomy.to_dataframe()

    # taxonomy is features x [Taxon, Confidence]
    taxonomy_df = taxonomy_df.loc[feat_table.index]
    tax_num_df = taxonomy_df[taxonomy_df['Taxon'].str.contains(
        num_string)]
    tax_denom_df = taxonomy_df[taxonomy_df['Taxon'].str.contains(
        denom_string)]

    # drop columns (samples) in which no feature w/ string is present
    tax_num_df.drop(columns = 'Taxon', inplace = True)
    tax_denom_df.drop(columns = 'Taxon', inplace = True)

    tax_num_joined_df = tax_num_df.join(feat_table)
    tax_num_joined_df = tax_num_joined_df.loc[
        :, (tax_num_joined_df != 0).any(axis = 0)]
    tax_denom_joined_df = tax_denom_df.join(feat_table)
    tax_denom_joined_df = tax_denom_joined_df.loc[
        :, (tax_denom_joined_df != 0).any(axis = 0)]

    # keep only intersection of samples in which each feat string
    # is present
    samp_to_keep = set(tax_num_joined_df.columns).intersection(
        set(tax_denom_joined_df.columns))
    tax_num_joined_df = tax_num_joined_df[samp_to_keep]
    tax_denom_joined_df = tax_denom_joined_df[samp_to_keep]

    tax_num_sample_sum = tax_num_joined_df.sum(axis = 0)
    tax_denom_sample_sum = tax_denom_joined_df.sum(axis = 0)

    # sometimes 2 feature labels are the same i.e. same features
    # don't want to check each time so only check if sums are
    # the same
    # e.g. if you are comparing g__A and s__B but g__A only
    # appears when followd by s__B -> log ratios will all = 1 
    # TODO: Figure out if this makes sense at all lol
    if tax_num_sample_sum.equals(tax_denom_sample_sum):
        a = set(tax_num_df.index)
        b = set(tax_num_df.index)
        if a == b:
            raise(ValueError('same features!'))

    comparison_df = pd.DataFrame.from_records(
        [tax_num_sample_sum, tax_denom_sample_sum],
        index = ['Num_Sum', 'Denom_Sum']).T
    comparison_df['log_ratio'] = comparison_df.apply(
        lambda x: np.log(x.Num_Sum/x.Denom_Sum), axis = 1)

    return comparison_df
