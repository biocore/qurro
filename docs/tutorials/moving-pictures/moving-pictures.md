# Qurro + QIIME 2 "Moving Pictures" Tutorial
*Note: this tutorial uses Qurro v0.5.0.*

## 0. Introduction

### 0.1. What is Qurro?

Lots of tools for analyzing " 'omic" datasets can produce __feature rankings__. These rankings can be used as a guide to look at the __log-ratios__ of certain features in a dataset. Qurro is a tool for visualizing both of these types of data.

#### 0.1.1. ...What are feature rankings?
The term "feature rankings" includes __differentials__, which we define as the estimated log-fold changes for features' abundances across different sample types. You can get this sort of output from lots of "differential abundance" tools, including but definitely not limited to [ALDEx2](https://bioconductor.org/packages/release/bioc/html/ALDEx2.html), [Songbird](https://github.com/biocore/songbird/), [Corncob](https://github.com/bryandmartin/corncob/), [DESeq2](https://bioconductor.org/packages/release/bioc/html/DESeq2.html), [edgeR](https://bioconductor.org/packages/release/bioc/html/edgeR.html), etc.

The term "feature rankings" also includes __feature loadings__ in a [biplot](https://en.wikipedia.org/wiki/Biplot) (see [Aitchison and Greenacre 2002](https://rss.onlinelibrary.wiley.com/doi/full/10.1111/1467-9876.00275)); you can get biplots from running [DEICODE](https://github.com/biocore/DEICODE), a tool designed to do this for microbiome datasets, or from a variety of other methods.

In either case, both of these flavors of "feature rankings" can be interpreted as, well, __rankings__ (i.e. you can just sort them numerically). When we visualize the rankings, we get a list of features in a dataset sorted based on their association with some sort of variation, in either a supervised (in the case of differentials) or unsupervised (in the case of feature loadings) way.

<div align="center">
<img src="https://github.com/mortonjt/probable-bug-bytes/raw/master/images/microbe_fold_change_11252019.png" alt="Feature rankings in an example dataset. Image c/o Jamie Morton." />

<i>Feature rankings in an example dataset. Figure c/o <a href="https://mortonjt.github.io/probable-bug-bytes/probable-bug-bytes/differential-abundance/">Jamie Morton</a>.</i>
</div>

#### 0.1.2. What can we do with feature rankings?

A common use of these rankings is examining the __log-ratios__ of particularly high- or low-ranked features across the samples in your dataset, and seeing how these log-ratios relate to your sample metadata (e.g. "does this log-ratio differ between 'healthy' and 'sick' samples?").

Log-ratio analyses are needed because data obtained from a microbiome study (or from [various other types of " 'omic" studies](https://microbiomejournal.biomedcentral.com/articles/10.1186/2049-2618-2-15)) is, in general, "compositional": we only have access to the relative abundances of features in each sample, instead of their absolute abundances. To quote [Gloor et al. 2017](https://www.frontiersin.org/articles/10.3389/fmicb.2017.02224):

> The starting point for any compositional analyses [_sic_] is a ratio transformation of the data. Ratio transformations capture the relationships between the features in the dataset and these ratios are the same whether the data are counts or proportions. Taking the logarithm of these ratios, thus log-ratios, makes the data symmetric and linearly related, and places the data in a log-ratio coordinate space ([Pawlowsky-Glahn et al., 2015](https://scholar.google.com/scholar_lookup?author=V.+Pawlowsky-Glahn&author=J.+J.+Egozcue&author=R.+Tolosana-Delgado+&publication_year=2015&title=Modeling+and+Analysis+of+Compositional+Data.)). Thus, we can obtain information about the log-ratio abundances of features relative to other features in the dataset, and this information is directly relatable to the environment.

For more details about creating and interpreting feature rankings, check out [Morton and Marotz et al. 2019](https://www.nature.com/articles/s41467-019-10656-5).

#### 0.1.3. What does Qurro do?

__Qurro is an interactive web application for visualizing feature rankings and log-ratios.__ It does this using a two-plot interface: on the left of the screen, a "rank plot" shows how features are ranked for a selected ranking, and on the right of the screen a "sample plot" shows the log-ratios of selected features' abundances within samples. There are a variety of controls available for selecting features for a log-ratio, and changing the selected log-ratio updates both the rank plot (highlighting selected features) and the sample plot (changing the y-axis value of each sample to match the selected log-ratio).

### 0.2. What is this tutorial going to cover?

In this tutorial, we'll visualize feature loadings in a biplot produced by DEICODE for the "Moving Pictures" dataset. We'll discuss various ways of using these feature loadings as a starting point for investigating log-ratios in a Qurro visualization.

**This tutorial will pick up from where the [DEICODE moving pictures tutorial](https://nbviewer.jupyter.org/github/biocore/DEICODE/blob/master/ipynb/tutorials/moving-pictures.ipynb) leaves off.** Don't worry if you haven't followed that tutorial yet; we'll provide all the files needed here.

## 1. Installing Qurro

First off, activate your QIIME 2 conda environment. If you don't already have QIIME 2 installed, there are instructions for installing it [here](https://docs.qiime2.org/2019.10/install/).

You can install Qurro using [pip](https://pip.pypa.io/en/stable/):

```
pip install qurro
```

(If this gives you trouble, you might need to run `pip install cython` first. However, you shouldn't need to worry about this if you're already in a QIIME 2 environment.)

Once you've installed Qurro, let's get QIIME 2 to recognize it. Run the following command in a terminal:

```
qiime dev refresh-cache
```

To verify that Qurro was installed properly, you can run the following command:

```
qiime qurro --help
```

If this command succeeds, you should see information about Qurro's QIIME 2 plugin.

## 2. Input files (what we'll need to run Qurro)

If you've completed the DEICODE tutorial already, you should already have these output files. If you haven't completed the DEICODE tutorial already, you'll need to download the necessary files for this tutorial here:

- `table.qza` [view](https://view.qiime2.org/?src=https%3A%2F%2Fdocs.qiime2.org%2F2019.10%2Fdata%2Ftutorials%2Fmoving-pictures%2Ftable.qza) | [download](https://docs.qiime2.org/2019.10/data/tutorials/moving-pictures/table.qza)
- `sample-metadata.tsv` [download](https://data.qiime2.org/2019.10/tutorials/moving-pictures/sample_metadata.tsv)
- `taxonomy.qza` [view](https://view.qiime2.org/?src=https%3A%2F%2Fdocs.qiime2.org%2F2019.10%2Fdata%2Ftutorials%2Fmoving-pictures%2Ftaxonomy.qza) | [download](https://docs.qiime2.org/2019.10/data/tutorials/moving-pictures/taxonomy.qza)
- `ordination.qza` [view](https://view.qiime2.org/visualization/?type=html&src=https%3A%2F%2Fraw.githubusercontent.com%2Fbiocore%2Fqurro%2Fmaster%2Fdocs%2Ftutorials%2Fmoving-pictures%2Fdata%2Fordination.qza) | [download](https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/data/ordination.qzv)
- `biplot.qzv` [view](https://view.qiime2.org/visualization/?type=html&src=https%3A%2F%2Fraw.githubusercontent.com%2Fbiocore%2Fqurro%2Fmaster%2Fdocs%2Ftutorials%2Fmoving-pictures%2Fdata%2Fbiplot.qzv) | [download](https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/data/biplot.qzv)

### 2.1. Looking at the biplot

DEICODE produces a biplot using Robust Aitchison PCA. As mentioned above, the "feature rankings" we're going to look at here are the feature loadings in this biplot.
(Just to be clear, the actual data describing the biplot -- the sample and feature
loadings -- are contained in the `ordination.qza` artifact that DEICODE produces;
a *visualization* of this data is contained in `biplot.qzv`, a visualization produced by Emperor.)

(If you'd like to learn about how DEICODE generates a biplot, check out [Martino et al. 2019](https://msystems.asm.org/content/4/1/e00016-19).)

When using Qurro to look at DEICODE output, it makes sense to look at both the
biplot and at the Qurro visualization. If we see a pattern in the biplot (e.g.
"most of the samples cluster by their body site", or "samples along axis 1 seem
to be separated by this metadata field"), then we can use that insight when
looking for differentially abundant features in Qurro. (And if you _don't_ observe
these sorts of patterns, that can still be interesting as well!)

So let's [open up `biplot.qzv` on view.qiime2.org (you can just click here)](https://view.qiime2.org/visualization/?type=html&src=https%3A%2F%2Fraw.githubusercontent.com%2Fbiocore%2Fqurro%2Fmaster%2Fdocs%2Ftutorials%2Fmoving-pictures%2Fdata%2Fbiplot.qzv):

#### TODO show just normal biplot viz, default

With a few clicks (changing colors in the `Axes` tab; clicking the "settings" button and toggling label visibility; coloring samples by `BodySite`; coloring features by `Taxon`) we can get a more informative and slightly prettier-looking visualization:

#### TODO SHOW GIF HERE ROTATING WITH BODY SITE AND ARROWS COLORED BY TAX; or just 2D screenshot

### 2.2. Interpreting the biplot

As was mentioned in the DEICODE moving pictures tutorial, it looks like samples
separate in this biplot by body site.<sup>1</sup> What's cool about biplots is that we can go further than just describing how samples vary in the ordination space. We can visualize features alongside samples, and see how these features are also associated with variation in the dataset. (See section 4 of [Aitchison and Greenacre (2002)](https://rss.onlinelibrary.wiley.com/doi/full/10.1111/1467-9876.00275) for details about interpreting biplots of compositional data.)

Now that we've familiarized ourselves with the biplot, let's take a look at a Qurro visualization of the corresponding feature loadings.

<sup>1</sup>This isn't that surprising; it's known
that the community of microorganisms living in someone's gut is generally pretty
different from, say, the community of microorganisms living on the skin of that same
person's hand (as a reference see, for example, [this paper](https://www.nature.com/articles/nature11234) from the Human Microbiome Project).

## 3. Generating a Qurro visualization

Since the type of rankings we're using are feature loadings, we'll need to use the `qiime qurro loading-plot` command to generate a Qurro visualization.

```
qiime qurro loading-plot \
    --i-table table.qza \
    --i-ranks ordination.qza \
    --m-sample-metadata-file sample-metadata.tsv \
    --m-feature-metadata-file taxonomy.qza \
    --o-visualization qurro-plot.qzv
```

##### Output Artifacts

- `qurro-plot.qzv` [view](https://view.qiime2.org/?src=https%3A%2F%2Fbiocore.github.io%2Fqurro%2Ftutorials%2Fmoving-pictures%2Fdata%2Fqurro-plot.qzv) | [download](https://biocore.github.io/qurro/tutorials/moving-pictures/data/qurro-plot.qzv)

You just generated your first Qurro visualization! `qurro-plot.qzv` is a `.qzv` file -- in other words, a QIIME 2 visualization. As with other QIIME 2 visualizations, you can view it either by running `qiime tools view qurro-plot.qzv` or by uploading it to [view.qiime2.org](https://view.qiime2.org/). (You can also just click on the "view" link right above to see a precomputed version of this visualization.)

## 4. Interacting with a Qurro visualization

Let's view `qurro-plot.qzv`, as described above. You should see something like
this:

<img src="https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/screenshots/qurro1.png" alt="Qurro interface screenshot #1. No features are selected." />

(The Qurro screenshots in this tutorial are zoomed out a bit so that we can show all the relevant parts of the display; depending on your screen resolution things might look a bit different.)

In any case, right away we see two things: on the left a plot of rankings (in this case, sorted loadings) for each feature, and on the right a plot of selected features' log ratios in samples. Throughout this tutorial these plots will be referred to as the __rank plot__ and __sample plot__, respectively.

Since no features are currently selected to be part of a log-ratio, these plots look pretty empty. Let's select some features!

### 4.1. Selecting features to construct log-ratios

##### TODO: might be a good idea to have a screenshot with like numbers-in-circles indicating what controls are what? adding in tooltips will help tho

Recall that we'd like to analyze the log-ratios between features' abundances across our samples.  In Qurro, "selecting features" lets us choose the numerator and denominator feature(s) of a log-ratio. The values of this log-ratio will be shown on the y-axis of the sample plot.

There are a few ways of selecting features for a log-ratio in Qurro:

#### 4.1.1. Autoselection

In **autoselection**, an equal number of features from both sides of the rank plot are selected for a log-ratio.

**Example:** selecting the log-ratio of the top 10% to bottom 10% of features for a given ranking.

**In practice:** this is really useful for quickly looking at the top- and bottom-ranked features for a given ranking -- for example, if you want to see "how well these rankings separate samples for a given metadata field."

##### TODO Screenshot in the MP dataset

#### 4.1.2. Filtering

Using **filtering**, you can select features based on focused searches through their IDs or metadata. The searches can be textual (e.g. selecting features where the `taxonomy` field contains the text `Ileibacterium`) or numeric (e.g. selecting features where some feature metadata value is less than 5).

**Example:** selecting the log-ratio of all features with taxonomy annotations containing the text `Staphylococcus` over all features with taxonomy annotations containing the text `Propionibacterium`.

**In practice:** this is useful for doing more targeted investigations than autoselection, since you have much more control over what features you include. For example, if a certain group of taxa seems especially highly- or lowly-ranked for a given ranking of interest, you can try filtering to that group here to see how all of the observed members of that taxonomic group are distributed throughout the rankings.

##### TODO Screenshot in the MP dataset

#### 4.1.3. Clicking

It's pretty basic compared to the other selection methods, but by **clicking on the rank plot twice** you can select simple log-ratios of single features. The first click sets the numerator feature for a log-ratio, and the second click sets the denominator feature for the log-ratio.

**Example:** if you have a small number of features, and you just want to look at a log-ratio of two features quickly.

**In practice:** this method isn't that useful compared to the other two, especially for complicated datasets. If you're having a hard time clicking on features, increasing the bar width via the slider below the rank plot can help with this.

##### TODO Screenshot in the MP dataset

#### 4.1.4. Sidenote: computing log-ratios involving > 2 features
In all of the selection methods above except for the "clicking" method, an arbitrary number of features can be present in the numerator or denominator of the log-ratio.

In this case, the log-ratio is computed for a given sample by summing the abundances of the numerator features, summing the abundances of the denominator features, and then taking the log-ratio of these sums. Written out as a formula, this is `log(top sum) - log(bottom sum)` (or, [equivalently](https://en.wikipedia.org/wiki/List_of_logarithmic_identities#Using_simpler_operations), `log(top sum / bottom sum)`).

There are other ways of computing log-ratios that are commonly used -- for example, taking the geometric or arithmetic mean of all feature abundances in the numerator or denominator. Support for these alternatives is planned.

### 4.2. First steps: trying out autoselection

[cover trying 5% / 5%]

[show using the tables to sort by highest / lowest ranked features]

[transition from here to textual searching]

### 4.3. Moving from autoselection to taxonomy-based filtering

Let's try the second of the selection options mentioned above (selecting features from a textual search) out. In particular, we'll compute the log ratio of all features identified as being in the order *Fusobacteriales* over all features identified as being in the order *Pseudomonadales*.

1. In the bottom-right corner of the Qurro visualization -- under the `Numerator` section -- change the feature field selector (it's the dropdown that comes right after some text that says "Filter to features where") to say `Taxon` instead of `Feature ID`. Now copy the text `o__Fusobacteriales` into the text box in this section.

2. Repeat this process for the `Denominator` section, but now copy the text `o__Pseudomonadales` instead.

3. Press the "Regenerate plots" button. You should see something like this:

<img src="https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/screenshots/qurro2.png" alt="Qurro interface screenshot #2. The log-ratio of o__Fusobacteriales to o__Pseudomonadales is selected." />

Congrats! You just constructed a log-ratio in Qurro. Both the rank plot and the sample plot should be updated now:

- The rank plot should now have some bars colored red and some bars colored blue. The red bars indicate the numerator features that were just selected (i.e. all features with taxonomy annotations containing the text `o__Fusobacteriales`), and the blue bar indicates the denominator features that were just selected (i.e. all features with taxonomy annotations containing the text `o__Pseudomonadales`).  

- The sample plot should now look like a scatterplot containing at least a few points. The y-axis value of each of these points is set to the log-ratio of the selected features' abundances; the x-axis values and colors are set to whatever metadata categories you'd like to use.

#### A limitation of basic text searching

This is great, but there's one thing to watch out for. Since Qurro only checks that a given feature's taxonomy annotation _contains the text_ `o__Fusobacteriales`, there's the potential for it to find other features that happen to contain the text `o__Fusobacteriales` in their taxonomy annotations but aren't actually in the order `o__Fusobacteriales`.

As a silly example, let's say a new order is discovered and named _Fusobacteriales2_. (This will almost certainly never happen, but you never know.) Since our search above only cares about a feature's taxonomy annotation containing the text `o__Fusobacteriales`, features that were classified as being in `o__Fusobacteriales2` would also get included in our searches!

In practice, we can account for this by changing the __search type__ (currently set to `contains the text`) options in Qurro. The `contains the separated text fragment(s)` setting will split up each feature's ID or metadata field at every occurrence of whitespace, commas, or semicolons, and then only search against perfect matches of each of those "fragments". This option is useful for searching against matches with taxonomic classifications -- it would protect us against our hypothetical `o__Fusobacteriales2` scenario.

(This sort of problem is also observable in practice when, for example, the features being investigated include Viruses in addition to Bacteria: there are plenty of _Staphylococcus_ species and plenty of _Staphylococcus_ phages, and a basic text search for just `Staphylococcus` will give you both. Check out a Qurro visualization of the [Byrd demo dataset](https://biocore.github.io/qurro/demos/byrd/index.html) for an example of this.)

### Customizing the sample plot

The sample plot's "x-axis" and "color" fields are initially set to whatever the first field was in your sample metadata file (in this case, `BarcodeSequence`).  This probably isn't super useful, so we can change these to more interesting metadata fields.

Let's try setting the x-axis to the `Body Site` field and the color to the `Subject` field. You can do this using the controls underneath the sample plot, on the middle-right side of the Qurro interface.

<img src="https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/screenshots/qurro3.png" alt="Qurro interface screenshot #3. The same log-ratio as before is selected, and the x-axis of the sample plot is set to BodySite (with 'left palm' and 'right palm' as displayed values) and the color of each point is set to Subject (either 'subject-1' or 'subject-2')." />

This is more interesting. Of course, there aren't a lot of samples in the plot, and this was a pretty arbitrary log-ratio we just selected. So it's hard to draw any meaningful conclusions from this.

Let's examine that first problem in more depth: _where are all of the missing samples in the sample plot_?

#### Sidenote: Missing samples

Notice the text underneath the sample plot controls? If you've been following along with the tutorial so far, it should say that only `15 / 34 samples (44.12%)` are shown in the sample plot. What gives?

As the text underneath this explains, it's because the other samples have invalid log-ratios. These other samples either didn't have any `o__Fusobacteriales` bacteria observed, didn't have any `o__Pseudomonadales` bacteria observed, or didn't have either of these bacteria observed.

Zeroes in either the top or bottom of a log-ratio mess things up. The logarithm of 0 / x (i.e the logarithm of 0) is undefined, as is the logarithm of x / 0 (since you straight-up can't divide by 0 in the first place).

## 5. Using Emperor alongside Qurro to try out log-ratios directly from a biplot

Let's say you see a feature in the biplot that you want to investigate in more detail. Here, we'll use the biplot from before as a way to "select features" in Qurro.

### 5.1. Selecting features from Emperor

First, make sure you've still got the biplot open in another browser tab or window.

Here's a screenshot of the biplot from before. Samples (spheres) are colored by their `BodySite` and features (arrows) are colored by their `Taxon`.

<img src="https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/screenshots/emperor1.png" alt="Screenshot of the biplot generated in the DEICODE tutorial, visualized in Emperor." />

Try double-clicking on the head of an arrow in this biplot. You should see a message pop up in the bottom left of your screen that says `(copied to clipboard)`, followed by a long sequence of characters. This indicates that you just copied the __Feature ID__ of this feature to your clipboard.

Move back to the tab or window where you have the Qurro plot open.  You can paste (using something like ctrl-V or &#8984;-V) the feature ID you just copied directly into the numerator or denominator search box, in the bottom right corner of Qurro's interface. You can do this twice (once for the numerator and once for the denominator) to create log-ratios of features directly from the biplot. (Make sure to change the feature field
selector back to `Feature ID`, since we're searching using these feature IDs directly.)

Now press the `Regenerate plots` button to select these two features, applying their log-ratio to the rank and sample plots.

Here, we'll look at the log-ratio of the feature represented by the purple arrow over the log-ratio of the feature represented by the orange arrow:

#### TODO: show figure of qurro plot post selection

### 5.2. Moving beyond single-feature log-ratios

As you can see, log-ratios using just one feature on each side are prone to sample dropout: only 5 of the 34 samples in the visualization have a valid log-ratio. Microbiome datasets are generally "sparse" -- that is, there are usually a lot of zeroes in a feature table -- and since zeroes mess up log-ratios, selecting log-ratios with small amounts of features can lead to dropout.

One way around this is by using features from a biplot as a starting point for further investigation. Look at the `Taxon` values of the features we just selected -- the feature represented by the purple arrow (pointing towards the tongue samples) is classified as `k__Bacteria; p__Fusobacteria; c__Fusobacteriia; o__Fusobacteriales; f__Fusobacteriaceae; g__Fusobacterium; s__`, while the feature represented by the orange arrow (pointing towards the left/right palm samples) is classified as `k__Bacteria; p__Firmicutes; c__Bacilli`. We can try generalizing this log-ratio by computing the log-ratio of, say, all features in `g__Fusobacterium` over all features in `c__Bacilli`: 

#### TODO: figure of this

So, we've figured out a log-ratio that sort of distinguishes tongue and palm samples. That's ... kind of useful?

Selecting features "optimally" is still an area of ongoing research, although some heuristics have been proposed (see the bottom of this document for some references). Our hope is that Qurro makes the process of established compositional data analysis methods -- using biplots and log-ratios -- easier; in the end, how you use it is up to you.

### 5.3. Hey, wait a second! There are only eight arrows in the biplot, but there are over five hundred features in the rank plot. What gives?

This is just a result of how the biplot visualization was created in the DEICODE tutorial. In the `qiime emperor biplot` command, the `--p-number-of-features` parameter was set to 8, so only 8 arrows (i.e. features) are shown in the Emperor visualization of the biplot. Feel free to try rerunning this command with a different number of features to show more features in the biplot.

(Emperor's choice of which features to show is based on features' "magnitude based on all ... dimensions" -- [see this comment and the surrounding QIIME 2 forum thread](https://forum.qiime2.org/t/how-to-make-pcoa-biplot-in-r-using-q2-deicode-ordination/8377/6) for context.)

## 6. Epilogue: Staving off p-hacking

So, I know what you might be thinking. **Isn't the problem of selecting features intractable?** For a dataset with _n_ features, there are on the order of _2<sup>n</sup>_ ways to select a group of features to include in the numerator or denominator of a log-ratio -- what does this mean in practice? Are all analyses that use Qurro doomed to be p-hacked to oblivion, since there are just so many things you can try?

Hopefully not! The idea with feature rankings is that these provide an intuitive way to select features -- Qurro was not designed to enable brute-forcing the selection of log-ratios. **If you find yourself trying lots of log-ratios over and over again in order to manipulate the sample plot to look "how you want it to," you should take a few steps back and ask yourself what question you're trying to answer.**

...However, yes, in practice there's nothing stopping you from spending hours trying over and over to manipulate things to find something interesting. This is a problem I've been thinking about for some time. A good way to account for this, which QIIME 2 and Qurro work well with, is **sharing your Qurro visualizations along with the rest of your data**. You can just upload the corresponding QZV file to GitHub, or to another data-hosting site, and other researchers can try out the visualization for themselves. If your conclusions don't hold up under scrutiny -- for example, your paper has a figure of the sample plot represented as a boxplot, but only a few samples are actually present in the boxplot because the rest were dropped and you didn't mention that in your paper -- then this should be apparent to other people recreating your work in Qurro.

## 7. Other work on selecting features
Other work has been done on the problem of figuring out how to best select features in a log-ratio (or "balance"). One cool method is [selbal](https://github.com/UVic-omics/selbal), described in [Rivera-Pinto et al. 2018](https://msystems.asm.org/content/3/4/e00053-18.abstract). In theory, you could use the output of selbal as a starting point for playing around with feature selection in a Qurro visualization, but I haven't tried this as of writing; if you try this, let me know how it goes!

[Morton and Marotz et al. 2019](https://www.nature.com/articles/s41467-019-10656-5) also offers a good review of log-ratio analyses, and how to interpret rank plots (see the section on "Interpreting ranks" for details). Of course, some of the authors of this paper are also authors of Qurro, so this might not be the most unbiased advice :)

## 8. Acknowledgements

This tutorial was based on the [DEICODE](https://nbviewer.jupyter.org/github/biocore/DEICODE/blob/master/ipynb/tutorials/moving-pictures.ipynb) and [QIIME 2](https://docs.qiime2.org/2019.10/tutorials/moving-pictures/) moving pictures tutorials.

## 9. Other Information

- [Qurro's main GitHub repository](https://github.com/biocore/qurro)
- [Qurro's website; includes a variety of demo visualizations using real data](https://biocore.github.io/qurro/)
