import os
import json 
import qiime2
import skbio
import biom
import q2templates
import pandas as pd
from shutil import copyfile
from biom import load_table
from skbio.util import get_data_path
from skbio import  OrdinationResults, stats
from rankratioviz.generate import process_input,gen_rank_plot,gen_sample_plot

def rank_plot(output_dir: str, table: biom.Table, 
                ranks: skbio.OrdinationResults, 
                sample_metadata: qiime2.Metadata, 
                feature_metadata: qiime2.Metadata , 
                in_catagory: str) -> None:

    # get data
    U, V, table, metadata = process_input(ranks, table, 
                                          sample_metadata.to_dataframe(), 
                                          feature_metadata.to_dataframe())
    rank_plot_chart = gen_rank_plot(U, V, 0)
    sample_plot_json = gen_sample_plot(table, metadata, in_catagory)
    # make dir 
    os.makedirs(os.path.join(output_dir,'rank_plot'), exist_ok=True)
    # copy files for viz
    loc_ = os.path.dirname(os.path.realpath(__file__))
    for file_ in os.listdir(os.path.join(loc_,'data')):
        if file_ != '.DS_Store':
            copyfile(get_data_path(file_), 
                     os.path.join(output_dir,'rank_plot',file_))
        if '.html' in file_:
            index = os.path.join(output_dir,'rank_plot',file_)
    #write new filez
    rank_plot_loc = os.path.join(output_dir,'rank_plot', 
                                 "rank_plot.json")
    sample_plot_loc = os.path.join(output_dir,'rank_plot',
                                   "sample_logratio_plot.json")
    rank_plot_chart.save(rank_plot_loc)
    with open(sample_plot_loc, "w") as jfile:
        json.dump(sample_plot_json, jfile)
    #render
    q2templates.render(index, output_dir)
    return