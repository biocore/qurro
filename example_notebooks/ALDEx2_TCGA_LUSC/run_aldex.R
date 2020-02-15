library(ALDEx2)
library(dplyr)

feat.table <- read.csv(
    "output/TCGA_LUSC_expression_feature_table_filt.tsv",
    sep="\t",
    stringsAsFactors=FALSE,
    row.names=1
)

sample.sheet <- read.csv(
    "input/gdc_sample_sheet.2020-02-13.tsv",
    sep="\t",
    stringsAsFactors=FALSE
)

sample.names <- as.vector(colnames(feat.table))

sample.types <- c()
for (sample in sample.names){
    # R replaces hyphens in TCGA barcodes with dots, so we change back
    sample <- gsub("\\.", "-", sample)
    sample.type <- sample.sheet[sample.sheet$Sample.ID == sample,]$Sample.Type
    sample.types <- c(sample.types, sample.type)
}

aldex.results <- aldex(
    feat.table,
    sample.types,
    mc.samples=128,
    test="t",
    effec=TRUE,
    include.sample.summary=FALSE,
    denom="all",
    verbose=TRUE,
)

aldex.results$Gene <- row.names(aldex.results)
aldex.results <- select(aldex.results, Gene, everything())

feature.names <- aldex.results$Gene

write.table(
    aldex.results,
    sep="\t",
    row.names=FALSE,
    file="output/TCGA_LUSC_aldex_results.tsv",
    quote=FALSE
)

print("ALDEx2 results written to output/TCGA_LUSC_aldex_results.tsv")
