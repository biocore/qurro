# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
import logging
from biom import load_table
import pandas as pd
import click
from rankratioviz._parameter_descriptions import EXTREME_FEATURE_COUNT, TABLE
from rankratioviz.generate import process_input, gen_visualization
from rankratioviz._rank_processing import rank_file_to_df


@click.command()
@click.option(
    "-r",
    "--ranks",
    required=True,
    help="Differentials output from songbird or Ordination output"
    + " from DEICODE.",
)
@click.option("-t", "--table", required=True, help=TABLE)
@click.option(
    "-fm", "--feature-metadata", default=None, help="Feature metadata file."
)
@click.option(
    "-sm", "--sample-metadata", required=True, help="Sample metadata file."
)
@click.option(
    "-o", "--output-dir", required=True, help="Location of output files."
)
@click.option(
    "-x",
    "--extreme-feature-count",
    default=None,
    type=int,
    help=EXTREME_FEATURE_COUNT,
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

    def read_metadata(md_file_loc):
        """Reads in the metadata file using pandas.read_csv().

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

    logging.debug("Starting the standalone rrv script.")
    loaded_biom = load_table(table)
    logging.debug("Loaded BIOM table.")
    df_sample_metadata = read_metadata(sample_metadata)
    feature_ranks = rank_file_to_df(ranks)

    df_feature_metadata = None
    if feature_metadata is not None:
        df_feature_metadata = read_metadata(feature_metadata)
    logging.debug("Read in metadata.")

    U, V, processed_table = process_input(
        feature_ranks,
        df_sample_metadata,
        loaded_biom,
        df_feature_metadata,
        extreme_feature_count,
    )
    gen_visualization(V, processed_table, U, output_dir)
    print(
        "Successfully generated a visualization in the folder {}.".format(
            output_dir
        )
    )


if __name__ == "__main__":
    plot()
