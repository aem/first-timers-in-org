# Find all first-time contributors in your GitHub Organization

This is a simple command-line utility that I'm using to get a list of all first-time contributors to a given GitHub organization in the current calendar month. It's limited in both configuration options and functionality (no configuration options, only one feature) and is not listen on NPM because it was just for my personal use. If you'd like to see a new feature or if you'd like to see this published to NPM I'd be happy to oblige.

Usage:
```sh
git clone git@github.com:aem/first-timers-in-org
cd first-timers-in-org
npm link
first-timers-in-org my-org
```

Example:
```
$ first-timers-in-org webpack

Searching for first-time contributions to webpack organization

Found a total of 42 contributors this month.

Filtering down to first-time contributors. Due to GitHub's API rate-limiting,
this will take about 2 minutes.

=====================================
First time contributors for webpack:
=====================================
/* ommitting usernames */
```
