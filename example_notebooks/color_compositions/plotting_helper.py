# NOTE: This file was taken directly from
# https://github.com/biocore/DEICODE/blob/master/ipynb/tutorials/assets/plotting_helper.py.
# All credit goes to Cameron Martino.
import pandas as pd
import numpy as np
import seaborn as sns
from matplotlib import pyplot as plt


def biplot(axis1, axis2, sload, fload, hue, ax,
           n_arrow= 15, level=2, cmap = 'Set1'):
    
    """
    This function is a helper for the tutorial. It
    takes ordination inputs from the tutorial and
    plots a compositional biplot.
    
    Parameters
    ----------
    axis1: str - first x-PC axis

    axis2: str - second y-PC axis
    
    sload: pd.DataFrame - sample ordination

    fload: pd.DataFrame - feature ordination

    hue: str - subject groupings
        
    ax: matplitlib subplot

    n_arrow: int - number of arrows to plot

    level: int - taxonomic level to collapse

    Returns
    ----------
    ax: matplitlib subplot

    """

    # sort the arrows by their PC1, PC2 mag.
    fload['magnitude'] = np.linalg.norm(fload[[axis1, axis2]], axis=1)
    fload = fload.sort_values('magnitude', ascending=False)
    
    # get cmap for arrows
    arrow_cmap = {
        "Black": "#000", "White": "#aaa", "Blue": "#00f", "Red":
        "#f00", "Yellow": "#ff0", "Other": "#f0f"
    }

    # plot the sample loadings
    sns.scatterplot(axis1, axis2,
                    data = sload,
                    hue = hue,
                    palette=cmap,
                    ax=ax)
    # plot the arrows
    legend_arrows = {}
    for i in range(n_arrow):
        # add arrow
        ind_ = fload.index[i]
        
    return ax
