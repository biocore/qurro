import pandas as pd
import numpy as np
from scipy.linalg import svd
from skbio.stats.composition import clr
import seaborn as sns
import matplotlib.pyplot as plt
plt.style.use("ggplot")

def apca(df):
    """Performs Aitchison PCA on a feature table.

    Parameters
    ----------
        df: pd.DataFrame
            A numeric DataFrame whose rows are "features" and whose columns are
            "samples."

    Returns
    -------
        A 3-tuple (U, p, V) where:

            U: pd.DataFrame
                Feature loadings.

            p: pd.DataFrame
                Proportions of variance explained.

            V: pd.DataFrame
                Sample loadings.
    """
    U, s, V = svd(clr(df))

    # Rename columns.
    pcs = min(df.shape)
    cols = ["PC{}".format(pc+1) for pc in range(min(df.shape))]

    # Make DataFrames from the feature (U) and sample (V) loadings
    U = pd.DataFrame(U[:, :pcs], df.index, cols)
    V = pd.DataFrame(V[:, :pcs], df.columns, cols)

    # For clarity, rename top-left cell in both loading DataFrames
    U.index.name = "FeatureID"
    V.index.name = "SampleID"

    # get prop. var. explained
    p = s**2 / np.sum(s**2)
    p = pd.DataFrame(p.T, cols, ["proportion_explained"])

    return U, p, V

def draw_painting_biplot(U, p, V, axis_1, axis_2):
    """Draws a biplot using Seaborn and Matplotlib.

    Parameters
    ----------
        U: pd.DataFrame
            Feature loadings.

        p: pd.DataFrame
            Proportion of variance explained for each PC.

        V: pd.DataFrame
            Sample loadings.

        axis_1: str
            Name of the first PC to draw in the biplot.

        axis_2: str
            Name of the second PC to draw in the biplot.
    """

    fig, ax = plt.subplots(1,1,figsize=(5,5))

    # Draw points using a Seaborn scatterplot
    sns.scatterplot(
        x=axis_1, y=axis_2, data=V, s = 100, alpha=.25, color="#000000", ax=ax
    )
    # add dot annotation
    for i in V.index:
        ax.text(V.loc[i, axis_1], V.loc[i, axis_2], str(i), zorder=-1)

    # add arrows
    acmap = {"Black":"#000000", "White":"#ffffff",
             "Blue":"#377eb8", "Red":"#e41a1c",
             "Yellow":"#ffff33", "Other":"#999999"}
    annots = []
    seqs = []
    for i in U.index:
        annots.append(ax.arrow(0, 0,
                               U.loc[i, axis_1] * .6,
                               U.loc[i, axis_2] * .6,
                               color=acmap[i],
                               alpha=0.8,
                               lw=0.75,
                               ec = "black",
                               length_includes_head=True,
                               head_width=.03, width=.009))
        ax.text(U.loc[i, axis_1] * .6,
                U.loc[i, axis_2] * .6,
                str(i), zorder=-1)
        seqs.append(i)

    # Hide grid lines
    ax.grid(False)
    ax.set_facecolor("#f0f0f0")

    # get axis labels
    ax.set_xlabel("%s (%.2f%%)" %\
                  (axis_1, p.loc[axis_1,
                                 "proportion_explained"] *100),
                 fontsize=16, color="#000000")
    ax.set_ylabel("%s (%.2f%%)" %\
                  (axis_2, p.loc[axis_2,
                                 "proportion_explained"] * 100),
                 fontsize=16, color="#000000")
    plt.show()
