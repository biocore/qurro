library(ALDEx2)

feat.table <- read.csv(
    "output/TCGA_LUSC_expression_feature_table_filt.tsv",
    sep="\t",
    stringsAsFactors=FALSE,
    row.names=1
)

sample.sheet <- read.csv(
    "output/sample_metadata.tsv",
    sep="\t",
    stringsAsFactors=FALSE
)

sample.names <- as.vector(colnames(feat.table))

# for this tutorial, we are going to run ALDEx2 on the sample type group
# in this example there are two states: Primary Tumor and Solid Tissue Normal
# between which we will be calculating ranks
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
    verbose=TRUE
)

aldex.results$Gene <- row.names(aldex.results)
num.col = length(aldex.results)
aldex.results <- aldex.results[,c("Gene", colnames(aldex.results)[1:num.col-1])]

write.table(
    aldex.results,
    sep="\t",
    row.names=FALSE,
    file="output/TCGA_LUSC_aldex_results.tsv",
    quote=FALSE
)

print("ALDEx2 results written to output/TCGA_LUSC_aldex_results.tsv")
