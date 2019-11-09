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
import pandas as pd

def qarcoal(table: biom.Table,
            taxonomy: pd.DataFrame,
            num_string: str, 
            denom_string: str) -> pd.Series:

    data = {'Name':['Tom', 'nick', 'krish', 'jack'], 
            'Age':[20, 21, 19, 18]}
    feat_table = pd.DataFrame(data)
    return feat_table['Age']
