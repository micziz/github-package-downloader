import { __dirname } from "./utils/__dirname.js";
import { prompt, promptYesNoe } from "./utils/prompt.js";
import { getVerion } from "./utils/getVersion.js";
import { appendFile } from 'fs/promises'
import fetch from "node-fetch";
import del from 'delete'
import { createSpinner } from 'nanospinner'
import chalk from 'chalk'

let url;
let end;

let oneSpinner = createSpinner(`Fetching ${process.argv[2]}`).start()

let releasesOpt = await getVerion(oneSpinner)

let resToFetchObj = await prompt('What relese?', releasesOpt)
let resToFetch = resToFetchObj.release

oneSpinner = createSpinner(`Fetching ${process.argv[2]} version ${resToFetch}`).start()

let res = await fetch(`https://api.github.com/repos/${process.argv[2]}/releases/tags/${resToFetch}`)
let json = await res.json()
if (res.ok) {
    oneSpinner.success()
} else{
    oneSpinner.error()
    throw 'Failed to get response! Is it a correct url?'
}

let options = []

json.assets.forEach(element => {
    options.push(element.name)
});

options.push('Tarball')
options.push('Zipball')

let message = 'What asset/binary would you like to download?' 

if (options.length == 0){
    let yesNo = await promptYesNoe(`${process.argv[2]} does not include assets in their release. Do you want to the source code for that release?`)
    if (yesNo.confirmDownload){
        message = `In what form would you like the source code?` 
    } else {
        console.log(chalk.bold('Ok! Exiting the script...'))
        process.exit(0)
    }
}

let response = await prompt(message, options)

let release = response.release
if (release == "Tarball" || release == "Zipball"){
        if (release == "Tarball"){
            url = `https://api.github.com/repos/${process.argv[2]}/tarball/${json.tag_name}`
            end = '.tar.gz'
        } else {
            url = `https://api.github.com/repos/${process.argv[2]}/zipball/${json.tag_name}`
            end = '.zip'
        }
        const spinnerSC = createSpinner(`Downloading ${release}`).start()
        try{
            let dl = await fetch(url)
            await del.promise(`source-code${end}`)
            await appendFile(`source-code${end}`, Buffer.from(await dl.arrayBuffer()))
            spinnerSC.success(`${release} downloaded`)
            console.log(chalk.green(`${release} succefuly donwloaded!`))
        } catch (err){
            spinnerSC.error()
            throw err;
        }
}else{
    const spinner = createSpinner(`Downloading ${release}`).start()
    let index = options.indexOf(release)
    try{
        let dl = await fetch(json.assets[index].browser_download_url)
        await del.promise(release)
        await appendFile(release, Buffer.from(await dl.arrayBuffer()))
        spinner.success(`${release} downloaded`)
        console.log(chalk.green(`${release} succefuly donwloaded!`))
    } catch (err){
        spinner.error(`Error in downloading ${release}`)
        throw err;
    }
}