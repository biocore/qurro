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
import os
import click
import json
from shutil import copyfile, copytree
from rankratioviz.generate import process_input, gen_rank_plot, gen_sample_plot


@click.command()
@click.option('-r', '--ranks', required=True,
              help="Ordination file output from a tool like DEICODE, songbird,"
              " etc.")
@click.option('-at', '--abundance-table', required=True,
              help="BIOM table describing taxon/metabolite sample abundances.")
@click.option('-fm', '--feature-metadata', default=None,
              help="Feature metadata file for taxonomy.")
@click.option('-sm', '--sample-metadata', required=True,
              help="Sample metadata file.")
@click.option('-c', '--category', required=True,
              help="Metadata table category to plot.")
@click.option('-o', '--output-dir', required=True,
              help="Location of output files.")
def plot(ranks: str, abundance_table: str, sample_metadata: str,
         output_dir: str, feature_metadata: str, category: str) -> None:
    """Generates a plot of ranked taxa/metabolites and their abundances."""

    # import
    loaded_biom = load_table(abundance_table)
    read_sample_metadata = pd.read_table(sample_metadata, index_col=0)
    ranks = skbio.OrdinationResults.read(ranks)
    taxonomy = None
    if feature_metadata is not None:
        taxonomy = pd.read_table(feature_metadata)
        taxonomy.set_index('feature id', inplace=True)

    U, V, table = process_input(ranks, loaded_biom, taxonomy)
    rank_plot_chart = gen_rank_plot(U, V, 0)
    sample_plot_json = gen_sample_plot(table, read_sample_metadata, category)
    os.makedirs(output_dir, exist_ok=True)
    # copy files for viz
    loc_ = os.path.dirname(os.path.realpath(__file__))
    support_files_loc = os.path.join(loc_, '..', 'support_files')
    for file_ in os.listdir(support_files_loc):
        if file_ != '.DS_Store':
            copy_func = copyfile
            # If we hit a directory in support_files/, just copy the entire
            # directory to our destination using shutil.copytree()
            if os.path.isdir(os.path.join(support_files_loc, file_)):
                copy_func = copytree
            copy_func(
                os.path.join(support_files_loc, file_),
                os.path.join(output_dir, file_)
            )
    # write new files
    rank_plot_loc = os.path.join(output_dir, 'rank_plot.json')
    sample_plot_loc = os.path.join(output_dir, 'sample_logratio_plot.json')
    rank_plot_chart.save(rank_plot_loc)
    # For reference: https://stackoverflow.com/a/12309296
    with open(sample_plot_loc, "w") as jfile:
        json.dump(sample_plot_json, jfile)
    return


if __name__ == '__main__':
    plot()
