# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

RANKS = (
    "Either feature differentials (contained in a TSV file, where each row "
    "describes a feature and each column describes a differential field) "
    "or a scikit-bio OrdinationResults file for a biplot (containing feature "
    "loadings). When sorted numerically, differentials and feature loadings "
    "alike provide 'rankings.'"
)

TABLE = (
    "A BIOM table describing the abundances of the ranked features in "
    "samples. Note that empty samples and features will be removed from the "
    "Qurro visualization."
)

Q2_SAMPLE_METADATA = (
    "Sample metadata. In Qurro visualizations, you can use sample metadata "
    "fields to change the x-axis and colors in the sample plot."
)

SAMPLE_METADATA = (
    "Sample metadata, formatted as a TSV file (where each row describes a "
    "sample and each column describes a 'metadata' field, and the first "
    "column contains sample IDs). In Qurro visualizations, you can use sample "
    "metadata fields to change the x-axis and colors in the sample plot."
)

Q2_FEATURE_METADATA = (
    "Feature metadata (for example, if your features are ASVs or OTUs, this "
    "could be taxonomy). You can use feature metadata fields to filter "
    "features in the rank plot when selecting log-ratios."
)

FEATURE_METADATA = (
    "Feature metadata, formatted as a TSV file (where each row describes a "
    "feature and each column describes a 'metadata' field, and the first "
    "column contains feature IDs). In Qurro visualizations, you can use "
    "feature metadata fields to filter features in the rank plot when "
    "selecting log-ratios."
)

EXTREME_FEATURE_COUNT = (
    "If specified, Qurro will only use this many "
    '"extreme" features from both ends of all of the rankings. '
    "This is useful when dealing with huge datasets (e.g. with "
    "BIOM tables exceeding 1 million entries), for which "
    "running Qurro normally might take a long amount of "
    "time or crash due to memory limits. Note that the automatic removal of "
    "empty samples and features from the table will be done *after* this "
    "filtering step."
)

DEBUG = "If this flag is used, Qurro will output debug messages."
