# tutorial-js-k6

[![build workflow](https://github.com/Xray-App/tutorial-js-k6/actions/workflows/main.yml/badge.svg)](https://github.com/Xray-App/tutorial-js-k6/actions/workflows/main.yml)
[![license](https://img.shields.io/badge/License-BSD%203--Clause-green.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/Xray-App/community)

## Overview

Code that supports the tutorial [Performance and load testing with k6](https://docs.getxray.app/display/XRAYCLOUD/Performance+and+load+testing+with+k6) showcasing the integration between [Xray Test Management](https://www.getxray.app/) on Jira and k6.

## Prerequisites

In order to run this tutorial, you need to have k6 installed.

## Running

Tests can be run using `k6`.

```bash
k6 run k6Performance.js
```

## Submitting results to Jira

Results can be submitted to Jira so that they can be shared with the team and their impacts be easily analysed.
This can be achieved using [Xray Test Management](https://www.getxray.app/) as shown in further detail in this [tutorial](https://docs.getxray.app/display/XRAYCLOUD/Performance+and+load+testing+with+k6).

## Contact

Any questions related with this code, please raise issues in this GitHub project. Feel free to contribute and submit PR's.
For Xray specific questions, please contact [Xray's support team](https://jira.getxray.app/servicedesk/customer/portal/2).


## LICENSE

[BSD 3-Clause](LICENSE)
