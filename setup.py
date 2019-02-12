#!/usr/bin/env python

# ----------------------------------------------------------------------------
# Copyright (c) 2018--, rankratioviz development team.
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
    Topic :: Software Development :: Libraries
    Topic :: Scientific/Engineering
    Topic :: Scientific/Engineering :: Bio-Informatics
    Topic :: Scientific/Engineering :: Visualization
    Programming Language :: Python :: 3
    Programming Language :: Python :: 3 :: Only
    Operating System :: Unix
    Operating System :: POSIX
    Operating System :: MacOS :: MacOS X
"""
classifiers = [s.strip() for s in classes.split('\n') if s]

description = \
    'Visualizes ranked taxa/metabolites and log ratios of their abundances'

with open('README.md') as f:
    long_description = f.read()

# TODO remove this if doable to simplify this.
# See https://packaging.python.org/guides/single-sourcing-package-version/
# -- option 6 is probably best, so long as we don't do something that would
# require use of another dependency from rankratioviz/__init__.py.
#
# version parsing from __init__ pulled from Flask's setup.py
# https://github.com/mitsuhiko/flask/blob/master/setup.py
_version_re = re.compile(r'__version__\s+=\s+(.*)')

with open('rankratioviz/__init__.py', 'rb') as f:
    hit = _version_re.search(f.read().decode('utf-8')).group(1)
    version = str(ast.literal_eval(hit))

setup(
    name='rankratioviz',
    version=version,
    license='BSD',
    description=description,
    long_description=long_description,
    author="rankratioviz development team",
    author_email="mfedarko@ucsd.edu",
    maintainer="rankratioviz development team",
    maintainer_email="mfedarko@ucsd.edu",
    packages=find_packages(),
    # Needed in order to ensure that q2/data/* and scripts/data/* are
    # installed (in turn, those are specified in MANIFEST.in).
    # See https://python-packaging.readthedocs.io/en/latest/non-code-files.html
    # for details.
    include_package_data=True,
    # TODO determine what versions we really care about. Also the ipython
    # versions differ btwn. here and ci/conda_requirements.txt; figure out
    # which is needed.
    # I don't see a need right now to specify any of these versions, but that
    # might change I guess (e.g. if scikit-bio doesn't have an
    # OrdinationResults type or it doesn't conform to a certain spec until a
    # certain version, then we should specify it in that case)
    install_requires=[
        'altair',
        'biom-format[extra]',
        'click',
        'pandas >= 0.10.0',
        'scikit-bio > 0.5.3'],
    classifiers=classifiers,
    entry_points={
        'qiime2.plugins':
        ['q2-rankratioviz=rankratioviz.q2.plugin_setup:plugin'],
        'console_scripts':
        ['rankratioviz=rankratioviz.scripts._plot:plot']
    },
    zip_safe=False
)
