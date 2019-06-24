from io import StringIO
import pytest
from pandas import DataFrame
from pandas.testing import assert_frame_equal
from qurro._rank_utils import differentials_to_df


def test_differentials_to_df_good_cases():
    """Tests various "good" inputs for _rank_utils.differentials_to_df()."""

    # Basic normal, happy case.
    # https://local.theonion.com/beautiful-cinnamon-roll-too-good-for-this-world-too-pu-1819576048
    good_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\t1.0\t2.0\nTaxon2\t3.0\t4.0"
    )
    good_diff_df_exp = DataFrame(
        {"Intercept": [1.0, 3.0], "Rank 1": [2.0, 4.0]},
        index=["Taxon1", "Taxon2"],
    )
    assert_frame_equal(good_diff_df_exp, differentials_to_df(good_diff))

    # Ensure feature IDs are handled as strings
    zeroindex_diff = StringIO(
        "\tIntercept\tRank 1\n01\t1.0\t2.0\n02\t3.0\t4.0"
    )
    zeroindex_diff_df_exp = DataFrame(
        {"Intercept": [1.0, 3.0], "Rank 1": [2.0, 4.0]}, index=["01", "02"]
    )
    assert_frame_equal(
        zeroindex_diff_df_exp, differentials_to_df(zeroindex_diff)
    )


def test_differentials_to_df_bad_cases():
    """Tests various "bad" inputs for _rank_utils.differentials_to_df()."""

    # Test that an error is thrown for missing value(s) (Taxon1 only has one
    # differential)
    missing_val_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\t2.0\nTaxon2\t3.0\t4.0"
    )
    with pytest.raises(ValueError):
        differentials_to_df(missing_val_diff)

    # Test that an error is thrown if there are any non-numeric values
    non_numeric_val_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\t'1.0'\t2.0\nTaxon2\t3.0\t4.0"
    )
    with pytest.raises(ValueError):
        differentials_to_df(non_numeric_val_diff)

    # Test that an error is thrown if there are any NaN values (nice try
    # pandas)
    nan_val_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\tNaN\t2.0\nTaxon2\t3.0\t4.0"
    )
    with pytest.raises(ValueError):
        differentials_to_df(nan_val_diff)

    # Test that an error is thrown if there are any Infinity values (yeah these
    # tests were as painful to write as they are to read right now, sorry)
    inf_val_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\tInfinity\t2.0\nTaxon2\t3.0\t4.0"
    )
    with pytest.raises(ValueError):
        differentials_to_df(inf_val_diff)

    # ... And test that -Infinity values also cause an error
    ninf_val_diff = StringIO(
        "\tIntercept\tRank 1\nTaxon1\t-Infinity\t2.0\nTaxon2\t3.0\t4.0"
    )
    with pytest.raises(ValueError):
        differentials_to_df(ninf_val_diff)
