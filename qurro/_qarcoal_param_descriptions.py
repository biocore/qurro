# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

QARCOAL_TAXONOMY = (
    "Taxonomy information to be used for selecting features in log-ratio."
)

QARCOAL_DESC = (
    "Compute the log-ratio of two specified feature strings by searching "
    "taxonomy for incidence of each string, summing all relevant feature "
    "counts for each sample, and taking the natural log of the numerator "
    "sum divided by denominator sum."
)

QARCOAL_TBL = (
    "Feature table describing the abundances of the features in samples."
)

QARCOAL_SHARED_FEAT = (
    "Boolean value denoting handling of features shared between numerator "
    "and denominator. If False, an error is raised if features are shared. "
    "If True, shared features are retained in log-ratio computation."
)

QARCOAL_SMP_TO_USE = (
    "Sample metadata file. If provided, log-ratios will only be calculated "
    "from sample labels present in this file."
)

QARCOAL_NUM = "Numerator string to search for in taxonomy."

QARCOAL_DENOM = "Denominator string to search for in taxonomy."
