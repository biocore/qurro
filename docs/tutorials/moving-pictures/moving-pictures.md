# Qurro + QIIME 2: "Moving Pictures" Tutorial
*Note: this tutorial uses Qurro v0.4.0, and is pretty out-of-date. We're working on updating this tutorial to use the latest version of Qurro and its new features, so please stay tuned (and sorry for the inconvenience!).*

## 0. Introduction

### What is Qurro?
Qurro visualizes the output from a tool like [Songbird](https://github.com/biocore/songbird) or [DEICODE](https://github.com/biocore/DEICODE). It displays a plot of __feature rankings__ (either the feature differentials produced by a tool like Songbird, or the feature loadings in a compositional biplot produced by a tool like DEICODE -- when sorted numerically, either of these input types provide rankings) alongside a plot showing the __log-ratios__ of selected features' abundances within samples.

**This tutorial will pick up from where the [DEICODE moving pictures tutorial](https://library.qiime2.org/plugins/deicode/19/) leaves off.** Don't worry if you haven't followed that tutorial yet; we'll provide all the files needed here.

### Why is this useful?

Regardless of if we're looking at feature differentials or feature loadings, what we care about when analyzing them are the log-ratios between feature abundances (or between groups of features' abundances), particularly as compared to sample metadata categories. Both [Songbird's paper (Morton and Marotz et al. 2019)](https://www.nature.com/articles/s41467-019-10656-5) and [DEICODE's paper (Martino et al. 2019)](https://msystems.asm.org/content/4/1/e00016-19) mention analyzing the log-ratios between features' abundances; Qurro provides an easy way to do this.

Log-ratio analyses are needed because data obtained from a microbiome study (or from [various other types of 'omic studies](https://microbiomejournal.biomedcentral.com/articles/10.1186/2049-2618-2-15)) is, in general, "compositional": we only have access to the relative abundances of features in each sample, instead of their absolute abundances.  To quote [Gloor et al. 2017](https://www.frontiersin.org/articles/10.3389/fmicb.2017.02224):

> The starting point for any compositional analyses [_sic_] is a ratio transformation of the data. Ratio transformations capture the relationships between the features in the dataset and these ratios are the same whether the data are counts or proportions. Taking the logarithm of these ratios, thus log-ratios, makes the data symmetric and linearly related, and places the data in a log-ratio coordinate space ([Pawlowsky-Glahn et al., 2015](https://scholar.google.com/scholar_lookup?author=V.+Pawlowsky-Glahn&author=J.+J.+Egozcue&author=R.+Tolosana-Delgado+&publication_year=2015&title=Modeling+and+Analysis+of+Compositional+Data.)). Thus, we can obtain information about the log-ratio abundances of features relative to other features in the dataset, and this information is directly relatable to the environment.

### What is this tutorial going to cover?

In this tutorial, we'll visualize feature loadings produced by DEICODE for the "Moving Pictures" dataset. We'll discuss various ways of selecting log-ratios in a Qurro visualization.

## 1. Installing Qurro

First off, activate your QIIME 2 environment. If you don't already have QIIME 2 installed, there are instructions for installing it [here](https://docs.qiime2.org/2019.7/install/).

You can install Qurro using [pip](https://pip.pypa.io/en/stable/):

```
pip install qurro
```

**Note 1:** A python version of at least 3.5 is required to use Qurro. (You can check this by running `conda info | grep python`; if you're in the latest QIIME 2 conda environment, you should already be using a good enough version of Python.)

**Note 2:** If you don't already have NumPy installed, you'll need to install it before installing Qurro! (However, if you're already in the latest QIIME 2 conda environment, you shouldn't need to worry about that.)

Once you've installed Qurro, let's get QIIME 2 to recognize it. Run the following command in a terminal:

```
qiime dev refresh-cache
```

To verify that Qurro was installed, you can run the following command:

```
qiime qurro --help
```

If this command succeeds, you should see information about Qurro's QIIME 2 plugin.

## 2. Input files (what we'll need to run Qurro)

If you've completed the DEICODE tutorial already, you can follow along here (using the output files you produced from DEICODE). If you haven't completed the DEICODE tutorial already, you can download the necessary files for this tutorial here:

- `table.qza` [view](https://view.qiime2.org/?src=https%3A%2F%2Fdocs.qiime2.org%2F2019.4%2Fdata%2Ftutorials%2Fmoving-pictures%2Ftable.qza) | [download](https://docs.qiime2.org/2019.4/data/tutorials/moving-pictures/table.qza)
- `sample-metadata.tsv` [download](https://data.qiime2.org/2019.4/tutorials/moving-pictures/sample_metadata.tsv)
- `taxonomy.qza` [view](https://view.qiime2.org/?src=https%3A%2F%2Fdocs.qiime2.org%2F2019.4%2Fdata%2Ftutorials%2Fmoving-pictures%2Ftaxonomy.qza) | [download](https://docs.qiime2.org/2019.4/data/tutorials/moving-pictures/taxonomy.qza)
- `ordination.qza` [view](https://view.qiime2.org/visualization/?type=html&src=https%3A%2F%2Fraw.githubusercontent.com%2Fbiocore%2Fqurro%2Fmaster%2Fdocs%2Ftutorials%2Fmoving-pictures%2Fdata%2Fordination.qza) | [download](https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/data/ordination.qzv)
- `biplot.qzv` [view](https://view.qiime2.org/visualization/?type=html&src=https%3A%2F%2Fraw.githubusercontent.com%2Fbiocore%2Fqurro%2Fmaster%2Fdocs%2Ftutorials%2Fmoving-pictures%2Fdata%2Fbiplot.qzv) | [download](https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/data/biplot.qzv)

## 3. Running Qurro

Since we'll be working with DEICODE output (i.e. feature loadings in a compositional biplot), we'll need to use the `qiime qurro loading-plot` command.

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

You just generated your first Qurro plot! `qurro-plot.qzv` is a `.qzv` file -- in other words, a QIIME 2 visualization. You can view it either by running `qiime tools view qurro-plot.qzv` or by uploading the file to [view.qiime2.org](https://view.qiime2.org/). (You can also just click on the "view" link right above to see a precomputed version of this visualization.)

## 4. Interacting with a Qurro visualization

Let's view `qurro-plot.qzv`, as described above. You should see something like
this:

<img src="https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/screenshots/qurro1.png" alt="Qurro interface screenshot #1. No features are selected." />

(The Qurro screenshots in this tutorial are zoomed out a bit so that we can
show all the relevant parts of the display; depending on your screen resolution
things might look a bit different.)

In any case, right away we see two things: on the left a plot of rankings (in this case, sorted loadings) for each feature, and on the right a plot of selected features' log ratios in samples. Throughout this tutorial these plots will be referred to as the __rank plot__ and __sample plot__, respectively.

Since no features are currently selected to be part of a log-ratio, these plots look pretty empty. Let's select some features!

### Selecting features to construct log-ratios

Recall that we'd like to analyze the log-ratios between features' abundances.  In Qurro, "selecting features" lets us define a __log-ratio__ between multiple features' abundances in each sample. That is, we can select the numerator and denominator feature(s) that make up this log-ratio.

There are a few ways of selecting features in Qurro:

1. One way is just by **clicking on the rank plot twice**. The first click sets the numerator feature for a log-ratio, and the second click sets the denominator feature for the log-ratio. (Increasing the bar width can help with this.)

2. You can also select features based on a **textual search through their IDs or metadata**. For example, it's possible to construct the log-ratio of all features with taxonomy annotations containing the text `Streptococcus` over all features with taxonomy annotations containing the text `Staphylococcus`.

3. You can also select features by **searching through their feature rankings or metadata numerically** (e.g. you can select all features with a differential above a certain threshold). This tutorial won't cover this option; feel free to try this out in Qurro, though!

#### Sidenote: computing log-ratios involving > 2 features
Note that in the latter two cases specified above -- where an arbitrary number of features can be in the numerator and denominator of the log-ratio -- the log-ratio is computed for a given sample by summing the feature abundances of the numerator features, summing the feature abundances of the denominator features, and then taking the log-ratio of these sums. Written out as a formula, this is `log(top sum) - log(bottom sum)` (or, [equivalently](https://en.wikipedia.org/wiki/List_of_logarithmic_identities#Using_simpler_operations), `log(top sum / bottom sum)`).

### First steps: selecting features by textual searching

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

## 5. Combining Qurro and Emperor

If you followed the DEICODE tutorial, you might remember visualizing the output biplot in Emperor (this is the `biplot.qzv` visualization that we downloaded earlier). Here, we'll use this visualized biplot as a way to select features in Qurro.

### Selecting features directly from a biplot

First, open up the biplot in a new browser tab or window. As with the Qurro plot, you can do this using `qiime tools view` or by uploading `biplot.qzv` to [view.qiime2.org](https://view.qiime2.org/).

Here's a screenshot of the biplot, with samples colored by their `BodySite` and features (arrows) colored by their `Taxon`. (Feature labels have been hidden in this screenshot.)

<img src="https://raw.githubusercontent.com/biocore/qurro/master/docs/tutorials/moving-pictures/screenshots/emperor1.png" alt="Screenshot of the biplot generated in the DEICODE tutorial, visualized in Emperor." />

Try double-clicking on an arrow in this biplot. You should see a message pop up in the bottom left of your screen that says `(copied to clipboard)`, followed by a long sequence of characters. This indicates that you just copied the __Feature ID__ of this feature to your clipboard.

Move back to the tab or window where you have the Qurro plot open.  You can paste (using something like ctrl-V or &#8984;-V) the feature ID you just copied directly into the numerator or denominator search box, in the bottom right corner of Qurro's interface. You can do this twice (once for the numerator and once for the denominator) to create log-ratios of features directly from the biplot. (Make sure to change the feature field
selector back to `Feature ID`, since we're searching using these feature IDs.)

Now press the `Regenerate plots` button to select these two features, applying their log-ratio to the rank and sample plots.

#### Hey, wait a second! There are only eight arrows in the biplot, but there are over five hundred features in the rank plot. What gives?

This is just a result of how the biplot visualization was created in the DEICODE tutorial. In the `qiime emperor biplot` command, the `--p-number-of-features` parameter was set to 8, so only 8 arrows (i.e. features) are shown in the Emperor visualization of the biplot. Feel free to try rerunning this command with a different number of features to show more features in the biplot.

(Emperor's choice of which features to show is based on features' "magnitude based on all ... dimensions" -- [see this comment and the surrounding QIIME 2 forum thread](https://forum.qiime2.org/t/how-to-make-pcoa-biplot-in-r-using-q2-deicode-ordination/8377/6) for context.)

## 6. Epilogue: In practice, how should I actually select features in Qurro?

That's a good question! You have lots of strategies in choosing what to inspect in a Qurro visualization. This section discusses only a subset of these; in the end, Qurro leaves the decision of how to investigate your data up to you. We hope it makes this investigation easier, though!

### (Semi-)manually inspecting highly- or lowly-ranked features
One strategy (as mentioned in the [songbird FAQ](https://github.com/biocore/songbird#faqs), regarding differentials) is to "...investigate the top/bottom microbes [features] with the highest/lowest ranks."

You can identify these "highest/lowest" ranked features by manually inspecting the rank plot (increasing the bar width makes this easier), or by picking out features that appear to be strongly associated with clustering of your samples in a biplot, as we did with Emperor above.

One solid strategy for conducting a log-ratio test is looking at particularly high- or low-ranked features, seeing what taxonomic classifications are used for these features, and using those taxonomic classifications to construct more detailed log-ratios using text searching. Qurro's variety of search options should hopefully make this process straightforward.

### Other work on selecting features
Other work has been done on this problem; see, for example, [selbal](https://github.com/UVic-omics/selbal) (described in [Rivera-Pinto et al. 2018](https://msystems.asm.org/content/3/4/e00053-18.abstract)). In theory, you could use the output of selbal as a starting point for playing around with feature selection in a Qurro visualization, but I haven't tried this as of writing.

[Songbird's paper (Morton and Marotz et al. 2019)](https://www.nature.com/articles/s41467-019-10656-5) also offers a good review of log-ratio analyses (...of course, some of the authors of this paper are also authors of Qurro, so that might not be the most unbiased advice :).

## 7. Acknowledgements

This tutorial was based on the [DEICODE](https://library.qiime2.org/plugins/deicode/19/) and [QIIME 2](https://docs.qiime2.org/2019.4/tutorials/moving-pictures/) moving pictures tutorials.

## 8. Other Information

- [Qurro's main GitHub repository](https://github.com/biocore/qurro)
- [Qurro's website; includes a variety of demo visualizations using real data](https://biocore.github.io/qurro/)
