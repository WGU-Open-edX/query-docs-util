# Query Docs Util GitHub App

This is an app that will query your GitHub organization for lines of documentation added and deleted. It filters based on `.md`, `.rst`, and `.adoc` files and `/docs` folders.

## Create environment file

You will need to create a `.env` file with the following variables:
```
GITHUB_APP_ID = <number>
PEM_PATH = <string path>
INSTALLATION_ID = <number>
GITHUB_ORG_NAME = <string>
```
