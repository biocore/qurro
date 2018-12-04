from RankRatioViz import gen_plots
import os

def test_byrd():
    # Super basic initial "test." This just makes sure that we don't get any
    # errors. (I'll make this actually test stuff soon.)
    gen_plots.run_script(["-r", "byrd_inputs/beta.csv",
        "-t", "byrd_inputs/byrd_skin_table.biom",
        "-m", "byrd_inputs/byrd_metadata.txt",
        "-d", "tests/output"])
    
