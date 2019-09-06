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
    '"extreme" features from both ends of all of the rankings. '
    "This is useful when dealing with huge datasets (e.g. with "
    "BIOM tables exceeding 1 million entries), for which "
    "running Qurro normally might take a long amount of "
    "time or crash due to memory limits. Note that the automatic removal of "
    "empty samples and features from the table will be done *after* this "
    "filtering step."
)

DEBUG = "If this flag is used, Qurro will output debug messages."
