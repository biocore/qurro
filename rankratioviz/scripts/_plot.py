# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------
from biom import load_table
import pandas as pd
import skbio
import click
from rankratioviz.generate import process_input, gen_visualization


@click.command()
@click.option('-r', '--ranks', required=True,
              help="Ordination file output from a tool like DEICODE, songbird,"
              " etc.")
@click.option('-t', '--table', required=True,
              help="BIOM table describing taxon/metabolite sample abundances.")
@click.option('-fm', '--feature-metadata', default=None,
              help="Feature metadata file for taxonomy.")
@click.option('-sm', '--sample-metadata', required=True,
              help="Sample metadata file.")
@click.option('-o', '--output-dir', required=True,
              help="Location of output files.")
def plot(ranks: str, table: str, sample_metadata: str, feature_metadata: str,
         output_dir: str) -> None:
    """Generates a plot of ranked taxa/metabolites and their abundances."""

    # import
    loaded_biom = load_table(table)
    df_sample_metadata = pd.read_csv(sample_metadata, index_col=0, sep='\t')
    ranks = skbio.OrdinationResults.read(ranks)
    taxonomy = None
    if feature_metadata is not None:
        taxonomy = pd.read_csv(feature_metadata, sep='\t')
        taxonomy.set_index('feature id', inplace=True)

    V, processed_table = process_input(ranks, loaded_biom, taxonomy)
    gen_visualization(V, processed_table, df_sample_metadata, output_dir)


if __name__ == '__main__':
    plot()
