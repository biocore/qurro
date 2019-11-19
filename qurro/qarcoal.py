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


def filter_and_join_taxonomy(feat_table, taxonomy, num_string, denom_string):
    """Perform taxonomy searching and join with feature table.

    Parameters:
    -----------
        feat_table: pd.DataFrame of features x samples
        taxonomy: pd.DataFrame of features x [Taxon, ...]
        num_string: numerator string to search for in taxonomy
        denom_string: denominator string to search for in taxonomy

    Returns:
    --------
        num_df: pd.DataFrame of numerator features x samples
        denom_df: pd.DataFrame of denominator features x samples
    """

    # need to keep Taxon temporarily to match up with feature table
    # can immediately discard non-Taxon columns
    taxonomy = taxonomy.copy()
    taxonomy = taxonomy[["Taxon"]]

    # retain only features that are in both feature table and taxonomy
    # rsuffix provided in unlikely case that a sample is called Taxon
    taxonomy_joined_df = taxonomy.join(feat_table, how="inner", rsuffix="_q")

    tax_num_df = taxonomy_joined_df[
        taxonomy_joined_df["Taxon"].str.contains(num_string)]
    tax_denom_df = taxonomy_joined_df[
        taxonomy_joined_df["Taxon"].str.contains(denom_string)]

    # want to drop Taxon column because we want the dfs to be only numeric
    tax_num_df.drop(columns="Taxon", inplace=True)
    tax_denom_df.drop(columns="Taxon", inplace=True)

    # if _q suffix was added due to sample called Taxon, change back to Taxon
    if "Taxon_q" in taxonomy_joined_df:
        tax_num_df.rename(columns={"Taxon_q": "Taxon"}, inplace=True)
        tax_denom_df.rename(columns={"Taxon_q": "Taxon"}, inplace=True)

    if tax_num_df.shape[0] == 0:
        if tax_denom_df.shape[0] == 0:
            raise ValueError("neither feature found!")
        else:
            raise ValueError("numerator not found!")
    elif tax_denom_df.shape[0] == 0:
        raise ValueError("denominator not found!")
    else:
        pass

    # drop columns (samples) in which no feature w/ string is present
    tax_num_df = tax_num_df.loc[
        :, (tax_num_df != 0).any(axis=0)
    ]
    tax_denom_df = tax_denom_df.loc[
        :, (tax_denom_df != 0).any(axis=0)
    ]

    # keep only intersection of samples in which each feat string
    # is present
    samp_to_keep = set(tax_num_df.columns).intersection(
        set(tax_denom_df.columns)
    )
    tax_num_df = tax_num_df[samp_to_keep]
    tax_denom_df = tax_denom_df[samp_to_keep]
    return tax_num_df, tax_denom_df


def qarcoal(
    table: biom.Table,
    taxonomy: pd.DataFrame,
    num_string: str,
    denom_string: str,
    samples_to_use: Metadata = None,
    allow_shared_features: bool = False,
) -> pd.DataFrame:
    """Calculate sample-wise log-ratios of features based on taxonomy.

    Parameters:
    -----------
        table: biom file with which to calculate log ratios
        taxonomy: pd.DataFrame with taxonomy information (should have Taxon
            column in which features will be searched)
        num_string: numerator string to search for in taxonomy
        denom_string: denominator string to search for in taxonomy
        sample_to_use: Q2 Metadata file with samples to use (optional)
        allow_shared_features: bool denoting whether to raise error
            if features are shared between numerator and denominator
            (default: False)

    Returns:
    --------
        comparison_df: pd DataFrame in the form:

            Sample-ID    Num_Sum    Denom_Sum   log_ratio
                   S1          7           15   -0.762140
    """

    # biom table is features x samples
    if samples_to_use is not None:
        samp = set(samples_to_use.to_dataframe().index)
        feat_table = table.filter(samp, axis="sample", inplace=False)
        feat_table = feat_table.to_dataframe()
    else:
        feat_table = table.to_dataframe()

    tax_num_df, tax_denom_df = filter_and_join_taxonomy(
        feat_table,
        taxonomy,
        num_string,
        denom_string,
    )

    # if shared features are disallowed, check to make sure they don't occur
    # if allowed, can skip this step at user's risk
    if not allow_shared_features:
        shared_features = set(tax_num_df.index) & set(tax_denom_df.index)
        if shared_features:
            raise ValueError("Shared features between num and denom!")

    tax_num_sample_sum = tax_num_df.sum(axis=0)
    tax_denom_sample_sum = tax_denom_df.sum(axis=0)

    comparison_df = pd.DataFrame.from_records(
        [tax_num_sample_sum, tax_denom_sample_sum],
        index=["Num_Sum", "Denom_Sum"],
    ).T
    comparison_df["log_ratio"] = comparison_df.apply(
        lambda x: np.log(x.Num_Sum / x.Denom_Sum), axis=1
    )

    return comparison_df
