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


def qarcoal(
    table: biom.Table,
    taxonomy: pd.DataFrame,
    num_string: str,
    denom_string: str,
    samples_to_use: Metadata = None,
    allow_shared_features: bool = False,
) -> pd.DataFrame:
    """Calculate sample-wise log-ratios of features with
    num_string in numerator over denom_string in denominator.

    Parameters:
    -----------
        table: biom file with which to calculate log ratios
        taxonomy: Qiime2 compliant feature taxonomy metadata file
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

    # taxonomy is features x [Taxon, Confidence]
    taxonomy_df = taxonomy.loc[feat_table.index]
    tax_num_df = taxonomy_df[taxonomy_df["Taxon"].str.contains(num_string)]
    tax_denom_df = taxonomy_df[taxonomy_df["Taxon"].str.contains(denom_string)]

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
    tax_num_df.drop(columns=["Taxon", "Confidence"], inplace=True)
    tax_denom_df.drop(columns=["Taxon", "Confidence"], inplace=True)

    tax_num_joined_df = tax_num_df.join(feat_table)
    tax_num_joined_df = tax_num_joined_df.loc[
        :, (tax_num_joined_df != 0).any(axis=0)
    ]
    tax_denom_joined_df = tax_denom_df.join(feat_table)
    tax_denom_joined_df = tax_denom_joined_df.loc[
        :, (tax_denom_joined_df != 0).any(axis=0)
    ]

    # keep only intersection of samples in which each feat string
    # is present
    samp_to_keep = set(tax_num_joined_df.columns).intersection(
        set(tax_denom_joined_df.columns)
    )
    tax_num_joined_df = tax_num_joined_df[samp_to_keep]
    tax_denom_joined_df = tax_denom_joined_df[samp_to_keep]

    tax_num_sample_sum = tax_num_joined_df.sum(axis=0)
    tax_denom_sample_sum = tax_denom_joined_df.sum(axis=0)

    # if shared features are disallowed, check to make sure they don't occur
    # if allowed, can skip this step at user's risk
    if not allow_shared_features:
        shared_features = set(tax_num_df.index) & set(tax_denom_df.index)
        if shared_features:
            raise ValueError("Shared features between num and denom!")

    comparison_df = pd.DataFrame.from_records(
        [tax_num_sample_sum, tax_denom_sample_sum],
        index=["Num_Sum", "Denom_Sum"],
    ).T
    comparison_df["log_ratio"] = comparison_df.apply(
        lambda x: np.log(x.Num_Sum / x.Denom_Sum), axis=1
    )

    return comparison_df
