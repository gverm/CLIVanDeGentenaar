import type { Arguments, CommandBuilder } from "yargs"
import fetch from "cross-fetch"
const inquirer = require("inquirer")

type Options = {
  query: string
}

export const command: string = "search <query>"
export const desc: string = "Search for <query>"

export const builder: CommandBuilder<Options, Options> = (yargs) =>
  yargs.positional("query", { type: "string", demandOption: true })

export const handler = async (argv: Arguments<Options>): Promise<void> => {
  const { query } = argv

  //Search web portal
  process.stdout.write(`Searching for ${query}!\n`)
  const res = await fetch("https://data.collectie.gent/api/graphql", {
    headers: {
      accept: "*/*",
      "accept-language": "nl-BE,nl-NL;q=0.9,nl;q=0.8,en-US;q=0.7,en;q=0.6",
      "cache-control": "no-cache",
      "content-type": "application/json",
      pragma: "no-cache",
      "sec-ch-ua":
        '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      cookie:
        "_ga_263957216=GS1.1.1663676168.11.1.1663676201.0.0.0; PersistTheCookie=!JWFYBtu4wd8bIy09wTXs/TRG6ZRhH30V3BPZNvH6V5BSpAuxPWC3+tmXVHYyrA7Pxm8vSLWrcR06Voo=; disclaimer=seen; connect.sid=s%3A4Bk1CRElQFsy0p_7zIUwMl6wISVes8pp.apKtLDv6hteTwXiUMOYvj0%2BB2zEQ7oSXuEVZDgqN9V0; TS01677d78=014f996f58df960d491984abfd5c2efb13fdc9818bd054e25eec97433ad39d0caab30f24690a1151f2b2a6b84519d6322dd3921c7dfd0138b77ca6262adf17cf3232219642165475ee85c00c7188bcef2cb61e7d18; _gid=GA1.2.1366926582.1665826727; _gat_gtag_UA_119303759_3=1; _gat_UA-119303759-3=1; _ga_179029R86H=GS1.1.1665826726.8.0.1665826726.0.0.0; _ga=GA1.1.1007222309.1662988477",
      Referer: "https://data.collectie.gent/",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: `{"operationName":"getEntities","variables":{"limit":25,"skip":0,"searchValue":{"value":"${query}","isAsc":false,"relation_filter":[],"randomize":false,"key":"title","has_mediafile":true,"skip_relations":false,"and_filter":false}},"query":"query getEntities($limit: Int, $skip: Int, $searchValue: SearchFilter!) {\\n  Entities(limit: $limit, skip: $skip, searchValue: $searchValue) {\\n    count\\n    limit\\n    results {\\n      ...minimalEntity\\n      __typename\\n    }\\n    relations {\\n      ...fullRelation\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\\nfragment minimalEntity on Entity {\\n  id\\n  object_id\\n  type\\n  title: metadata(key: [title]) {\\n    key\\n    value\\n    __typename\\n  }\\n  description: metadata(key: [description]) {\\n    key\\n    value\\n    __typename\\n  }\\n  primary_mediafile\\n  primary_transcode\\n  primary_mediafile_info {\\n    width\\n    height\\n    __typename\\n  }\\n  mediafiles {\\n    mediatype {\\n      type\\n      mime\\n      image\\n      audio\\n      video\\n      pdf\\n      __typename\\n    }\\n    __typename\\n  }\\n  __typename\\n}\\n\\nfragment fullRelation on Relation {\\n  key\\n  type\\n  label\\n  value\\n  order\\n  __typename\\n}\\n"}`,
    method: "POST",
  })
  const results = await res.json()

  //Get first item from results
  if (!results.data.Entities.results[0]) {
    process.stdout.write("No result \n")
    process.exit()
  }
  const asset = results.data.Entities.results[0]

  //Get ascii art
  const body = `{
    "url": "https://api.collectie.gent/storage/v1/download/${asset.primary_transcode}"
  }`

  const asciiRep = await fetch(`http://localhost:5000/asciiart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
  const ascii = await asciiRep.json()
  process.stdout.write(ascii.toString())

  //Load tenserflow options
  const tensorRep = await fetch(`http://localhost:5000/annotate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  })
  const tensor = await tensorRep.json()
  inquirer
    .prompt([
      {
        name: "imageContent",
        type: "checkbox",
        message: "What do you see in the ASCII ?",
        choices: [...tensor, "it's all trash."],
      },
    ])
    .then((answers: any) => {
      process.stdout.write(`Your answer is: ${answers.imageContent.join()}\n`)
      //Write link to webportal
      process.stdout.write(
        `See the real image on: \nhttps://data.collectie.gent/entity/${asset.object_id}\n`
      )
      process.exit(0)
    })
}
