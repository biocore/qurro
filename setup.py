#!/usr/bin/env python

# ----------------------------------------------------------------------------
# Copyright (c) 2018--, Qurro development team.
#
# NOTE: This file is derived from DEICODE's setup.py file.
#
# Distributed under the terms of the Modified BSD License.
#
# The full license is in the file LICENSE.txt, distributed with this software.
# ----------------------------------------------------------------------------

import re
import ast
from setuptools import find_packages, setup

classes = """
    Development Status :: 3 - Alpha
    License :: OSI Approved :: BSD License
    Topic :: Scientific/Engineering
    Topic :: Scientific/Engineering :: Bio-Informatics
    Topic :: Scientific/Engineering :: Visualization
    Programming Language :: Python :: 3.5
    Programming Language :: Python :: 3.6
    Programming Language :: Python :: 3 :: Only
    Operating System :: Unix
    Operating System :: POSIX
    Operating System :: MacOS :: MacOS X
"""
classifiers = [s.strip() for s in classes.split("\n") if s]

description = (
    "Visualizes differentially ranked features and log-ratios of their "
    "sample abundances"
)

with open("README.md") as f:
    long_description = f.read()

# TODO remove this if doable to simplify this.
# See https://packaging.python.org/guides/single-sourcing-package-version/
# -- option 6 is probably best, so long as we don't do something that would
# require use of another dependency from qurro/__init__.py.
#
# version parsing from __init__ pulled from Flask's setup.py
# https://github.com/mitsuhiko/flask/blob/master/setup.py
_version_re = re.compile(r"__version__\s+=\s+(.*)")

with open("qurro/__init__.py", "rb") as f:
    hit = _version_re.search(f.read().decode("utf-8")).group(1)
    version = str(ast.literal_eval(hit))

setup(
    name="qurro",
    version=version,
    license="BSD",
    description=description,
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Qurro development team",
    author_email="mfedarko@ucsd.edu",
    maintainer="Qurro development team",
    maintainer_email="mfedarko@ucsd.edu",
    url="https://github.com/biocore/qurro",
    # Although these are needed for setup, it seems like biom will still break
    # if we don't have numpy/cython manually installed beforehand. I think this
    # is due to how the setup_requires dependencies are downloaded; they aren't
    # officially "installed".
    setup_requires=["cython", "numpy >= 1.12.0"],
    packages=find_packages(),
    # Needed in order to ensure that support_files/*, etc. are installed (in
    # turn, these files are specified in MANIFEST.in).
    # See https://python-packaging.readthedocs.io/en/latest/non-code-files.html
    # for details.
    include_package_data=True,
    install_requires=[
        # Updating this pin will require updating the entire JS interface to
        # work with later versions of Vega-Lite, which is doable but likely not
        # worth the effort at the moment; see
        # https://github.com/biocore/qurro/issues/315
        "altair == 3.1.0",
        # 2.1.9 is the earliest BIOM version that adds support for pandas >= 1.
        # Also, it takes care of the issue where biom.Table.to_dataframe()
        # produced a dense instead of a sparse DataFrame.
        "biom-format[hdf5] >= 2.1.9",
        "click",
        "numpy >= 1.12.0",
        # SparseDataFrame is dead, long live DataFrame
        "pandas >= 1",
        "scikit-bio > 0.5.3",
        # Due to scikit-bio problems -- pinning to < 1.9.0. Should be hopefully
        # fixed when a new scikit-bio release comes out.
        # (https://github.com/biocore/scikit-bio/issues/1818)
        "scipy >= 1.3.0, < 1.9.0",
    ],
    # Based on how Altair splits up its requirements:
    # https://github.com/altair-viz/altair/blob/master/setup.py
    extras_require={
        "dev": [
            "pytest >= 4.2",
            "pytest-cov >= 2.0",
            "flake8",
            "nbconvert",
        ]
    },
    classifiers=classifiers,
    entry_points={
        "qiime2.plugins": ["q2-qurro=qurro.q2.plugin_setup:plugin"],
        "console_scripts": ["qurro=qurro.scripts._plot:plot"],
    },
    zip_safe=False,
    # altair 3.1.0 uses the "collections" module in a way that isn't compatible
    # with Python 3.10 and up. We should eventually un-pin altair to fix this.
    python_requires=">=3.6,<3.10",
)
