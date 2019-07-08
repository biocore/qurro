# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import logging
from biom import load_table
import click
from qurro._parameter_descriptions import (
    EXTREME_FEATURE_COUNT,
    TABLE,
    ASSUME_GNPS_FEATURE_METADATA,
)
from qurro.generate import process_and_generate
from qurro._rank_utils import read_rank_file
from qurro._metadata_utils import (
    read_metadata_file,
    read_gnps_feature_metadata_file,
)
from qurro._df_utils import escape_columns


@click.command()
@click.option(
    "-r",
    "--ranks",
    required=True,
    help="Feature differentials or a biplot OrdinationResults.",
)
@click.option("-t", "--table", required=True, help=TABLE)
@click.option(
    "-fm", "--feature-metadata", default=None, help="Feature metadata file."
)
@click.option(
    "-sm", "--sample-metadata", required=True, help="Sample metadata file."
)
@click.option(
    "-o",
    "--output-dir",
    required=True,
    help=(
        "Directory to write the HTML/JS/... files defining a Qurro "
        "visualization to. If this directory already exists, "
        "files/directories already within it will be overwritten if necessary."
    ),
)
@click.option(
    "-x",
    "--extreme-feature-count",
    default=None,
    type=int,
    help=EXTREME_FEATURE_COUNT,
)
@click.option(
    "-gnps",
    "--assume-gnps-feature-metadata",
    is_flag=True,
    help=ASSUME_GNPS_FEATURE_METADATA,
)
@click.option(
    "-v",
    "--verbose",
    is_flag=True,
    help="If passed, this will output debug messages.",
)
def plot(
    ranks: str,
    table: str,
    sample_metadata: str,
    feature_metadata: str,
    output_dir: str,
    extreme_feature_count: int,
    assume_gnps_feature_metadata: bool,
    verbose: bool,
) -> None:
    """Generates a visualization of feature rankings and log ratios.

       The resulting visualization contains two plots. The first plot shows
       how features are ranked, and the second plot shows the log ratio
       of "selected" features' abundances within samples.

       The visualization is interactive, so which features are "selected" to
       construct log ratios -- as well as various other properties of the
       visualization -- can be changed by the user.
    """

    # inspired by https://stackoverflow.com/a/14098306/10730311
    if verbose:
        logging.basicConfig(level=logging.DEBUG)

    logging.debug("Starting the standalone Qurro script.")
    loaded_biom = load_table(table)
    logging.debug("Loaded BIOM table.")
    df_sample_metadata = escape_columns(
        read_metadata_file(sample_metadata), "sample metadata"
    )
    feature_ranks = read_rank_file(ranks)

    df_feature_metadata = None
    if feature_metadata is not None:
        if assume_gnps_feature_metadata:
            df_feature_metadata = read_gnps_feature_metadata_file(
                feature_metadata, feature_ranks
            )
        else:
            df_feature_metadata = escape_columns(
                read_metadata_file(feature_metadata), "feature metadata"
            )
    logging.debug("Read in metadata.")

    process_and_generate(
        feature_ranks,
        df_sample_metadata,
        loaded_biom,
        output_dir,
        df_feature_metadata,
        extreme_feature_count,
    )
    print(
        "Successfully generated a visualization in the folder {}.".format(
            output_dir
        )
    )


if __name__ == "__main__":
    plot()
