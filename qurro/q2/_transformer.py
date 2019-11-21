#!/usr/bin/env python

import pandas as pd
import qiime2
from qurro.q2._type import LogRatiosFormat
from qurro.q2.plugin_setup import plugin


# taken from q2-types/sample_data/_transformer.py
# https://github.com/qiime2/q2-types/blob/dc75cdeeb5e5535bc3c8bc703d06ef0adc1b58f9/q2_types/sample_data/_transformer.py#L18-L28
def _read_log_ratios(fh):
    # Using `dtype=object` and `set_index` to avoid type casting/inference
    # of any columns
    # want to keep index name as "Sample-ID"
    df = pd.read_csv(fh, sep="\t", header=0, dtype=object)
    df.set_index(df.columns[0], drop=True, append=False, inplace=True)
    # df.index.name = None
    # casting of columns adapted from SO post:
    # https://stackoverflow.com/a/36814203/3424666
    cols = df.columns
    df[cols] = df[cols].apply(pd.to_numeric, errors="ignore")
    return df


@plugin.register_transformer
def _1(ff: LogRatiosFormat) -> qiime2.Metadata:
    return qiime2.Metadata.load(str(ff))


@plugin.register_transformer
def _2(obj: qiime2.Metadata) -> LogRatiosFormat:
    ff = LogRatiosFormat()
    obj.save(str(ff))
    return ff


@plugin.register_transformer
def _3(data: pd.DataFrame) -> LogRatiosFormat:
    ff = LogRatiosFormat()
    with ff.open() as fh:
        data.to_csv(fh, sep="\t", header=True)
    return ff


@plugin.register_transformer
def _4(ff: LogRatiosFormat) -> pd.DataFrame:
    with ff.open() as fh:
        df = _read_log_ratios(fh)
    return df
