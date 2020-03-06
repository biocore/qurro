#!/usr/bin/env python

import glob
import re

import pandas as pd

sample_sheet = pd.read_csv(
    "gdc_sample_sheet.2020-02-13.tsv",
    sep="\t",
    index_col=1,
)

# files are saved in raw_data/ directory
expr_files = glob.glob("raw_data/*/*.gz")

all_expr_dfs = list()
for expr_file in expr_files:
    uuid = re.search("raw_data/.*?/(.*)$", expr_file).groups()[0]
    sample_id = sample_sheet.loc[uuid]["Sample ID"]
    expr_df = pd.read_csv(
        expr_file,
        sep="\t",
        header=None,
        index_col=0,
        names=[sample_id],
    )
    all_expr_dfs.append(expr_df)

expr_feat_table = pd.concat(all_expr_dfs, axis=1)
expr_feat_table = expr_feat_table.filter(regex="ENSG", axis=0)
expr_feat_table.index.name = "feature-id"
expr_feat_table.to_csv(
    "TCGA_LUSC_expression_feature_table.tsv",
    sep="\t",
    index=True,
)
