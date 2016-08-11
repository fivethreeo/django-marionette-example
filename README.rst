

Installation
============

Install `nodejs`_.

Install `Python`_.

Install virtualenv: ::
  
  pip install virtualenv

Windows: ::

    run install.bat
    run gulp manage # type migrate
    run gulp manage # type createsuperuser
    run build.bat
    run run.bat

To build without uglyfi: ::

   set nooptimize=true
   run build.bat or run.bat

Linux: ::

    bash install.sh
    gulp manage # type migrate
    gulp manage # type createsuperuser
    gulp build
    gulp serve

To build without uglyfi: ::

    nooptimize=true gulp build or gulp serve
  
Notes
=====

Signup not implemented.

.. _nodejs: https://nodejs.org/
.. _Python: https://www.python.org/