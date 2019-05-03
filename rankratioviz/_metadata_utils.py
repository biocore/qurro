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
