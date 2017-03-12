#! /usr/local/bin/node

const github = require("github")
const Moment = require("moment")
const log = console.log

const [_, __, org, ...rest] = process.argv
if (!org) {
  console.error("ERROR! No GitHub org provided. Please pass in a GitHub organization name")
  process.exit(1)
}

const API = new github({
  protocol: "https",
  host: "api.github.com",
  headers: {
    "user-agent": "My-First-PR-App"
  },
  Promise,
  timeout: 5000
})

const auth = () => {
  API.authenticate({
    type: "token",
    token: process.env.GH_TOKEN
  })
}

const num = (n) => n > 9 ? `${n}` : `0${n}`

// github rate-limits you at 30 search reqs/minute,
// so when we're searching for users we have to take some breaks
const sleep1Minute = () => {
  const future = (new Moment()).add(1, 'm')
  while ((new Moment()).isBefore(future)) { }
}

const today = new Date()
const request = async (req, opts) => {
  auth()
  return await req(opts)
}

const getFirstTimers = async () => {
  log(`\nSearching for first-time contributions to ${org} organization`)
  const contribs = new Map()
  const processResults = (resp) => {
    let items = resp.data.items
    items.forEach((val) => {
      contribs.set(val.user.login, (contribs.get(val.user.login) || 0) + 1)
    })
  }
  let resp = await request(API.search.issues, {
    q: `+type:pr+user:${org}+is:merged+merged:${today.getFullYear()}-${num(today.getMonth() + 1)}-01..${today.getFullYear()}-${num(today.getMonth() + 1)}-${(new Date(today.getFullYear(), today.getMonth() + 1, 0)).getDate()}`,
    sort: "updated",
    per_page: 100
  })
  processResults(resp)
  while (await request(API.hasNextPage, resp)) {
    sleep1Minute()
    resp = await request(API.getNextPage, resp)
    processResults(resp)
  }

  log(`\nFound a total of ${Array.from(contribs.keys()).length} contributors this month.`)
  log(`\nFiltering down to first-time contributors. Due to GitHub's API rate-limiting,
this will take about ${Math.round(Array.from(contribs.keys()).length / 25)} minutes.`)

  let firstTimeContribs = []
  let usernames = Array.from(contribs.keys())
  let chunks = []
  const CHUNK_SIZE = 25
  while (usernames.length >= CHUNK_SIZE) {
    chunks.push(usernames.slice(0, CHUNK_SIZE))
    usernames = usernames.slice(CHUNK_SIZE)
  }
  chunks.push(usernames)
  for (let chunk of chunks) {
    for (let user of chunk) {
      const resp = await request(API.search.issues, {
        q: `+author:${user}+type:pr+user:${org}+is:merged+merged:<${today.getFullYear()}-${num(today.getMonth() + 1)}-01`,
        per_page: 50
      })
      if (resp.data.items.length === 0) {
        firstTimeContribs.push(user)
      }
    }
    sleep1Minute()
  }
  log(`\n=====================================`)
  log(`First time contributors for ${org}:`)
  log(`=====================================`)
  firstTimeContribs.map(s => s.toLowerCase()).sort().forEach(c => log(c))
  log()
}

getFirstTimers()
