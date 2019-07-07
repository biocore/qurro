# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

TABLE = (
    "A BIOM table describing the abundances of the ranked features in "
    "samples. Note that empty samples and features will be removed from the "
    "Qurro visualization."
)

EXTREME_FEATURE_COUNT = (
    "If specified, Qurro will only use this many "
    '"extreme" features from either end of all of the rankings. '
    "This is useful when dealing with huge datasets (e.g. with "
    "BIOM tables exceeding 1 million entries), for which "
    "running Qurro normally might take a long amount of "
    "time or crash due to memory limits. This value must be at least 1, and "
    "must be an integer. Note that samples without any observed features "
    "after this filtering step will be removed from the Qurro visualization, "
    "as will features without any observations in samples (even features that "
    'were not filtered due to being sufficiently "extreme").'
)

ASSUME_GNPS_FEATURE_METADATA = (
    "If specified, Qurro will assume that the input feature metadata "
    "was obtained from GNPS. This means that Qurro will read each "
    'feature\'s ID as "A;B", where A is the mass-to-charge ratio of the '
    'feature (corresponding to the "parent mass" column in the feature '
    "metadata) and B is the discharge time of the feature (corresponding to "
    'the "RTConsensus" column in the feature metadata). Qurro will '
    'then only annotate feature IDs with their corresponding "LibraryID" '
    "column in the feature metadata file."
)
