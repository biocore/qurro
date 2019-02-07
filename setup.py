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
import os
import ast
from setuptools import find_packages, setup
from setuptools.command.build_ext import build_ext as _build_ext


class build_ext(_build_ext):
    def finalize_options(self):
        _build_ext.finalize_options(self)
        # Prevent numpy from thinking it is still in its setup
        # process:
        __builtins__.__NUMPY_SETUP__ = False
        import numpy
        self.include_dirs.append(numpy.get_include())


# Dealing with Cython
USE_CYTHON = os.environ.get('USE_CYTHON', False)
ext = '.pyx' if USE_CYTHON else '.c'

extensions = [
]

if USE_CYTHON:
    from Cython.Build import cythonize
    extensions = cythonize(extensions)

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
    ext_modules=extensions,
    cmdclass={'build_ext': build_ext},
    # TODO determine what versions we really care about. Also the ipython
    # versions differ btwn. here and ci/conda_requirements.txt; figure out
    # which is needed.
    # I don't see a need right now to specify any of these versions, but that
    # might change I guess (e.g. if scikit-bio doesn't have an
    # OrdinationResults type or it doesn't conform to a certain spec until a
    # certain version, then we should specify it in that case)
    install_requires=[
        'click',
        'altair',
        'ipython >= 3.2.0',  # TODO is this required?
        'matplotlib >= 1.4.3',
        'pandas >= 0.10.0',
        'scikit-bio > 0.5.3'],
    classifiers=classifiers,
    entry_points={
        'qiime2.plugins':
        ['q2-rankratioviz=rankratioviz.q2.plugin_setup:plugin'],
        'console_scripts':
        ['rankratioviz=rankratioviz.scripts._plot:plot']
    },
    package_data={},
    zip_safe=False
)
