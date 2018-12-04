from rankratioviz import gen_plots
import os

def test_byrd():
    test_input_dir = os.path.join("rankratioviz", "tests", "input", "byrd")
    # Super basic initial "test." This just makes sure that we don't get any
    # errors. (I'll make this actually test stuff soon.)
    gen_plots.run_script(["-r", os.path.join(test_input_dir, "beta.csv"),
        "-t", os.path.join(test_input_dir, "byrd_skin_table.biom"),
        "-m", os.path.join(test_input_dir, "byrd_metadata.txt"),
        "-d", os.path.join("rankratioviz", "tests", "output", "byrd")])
