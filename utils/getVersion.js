import fetch from "node-fetch";

export async function getVerion(oneSpinner){
    let releases = await fetch(`https://api.github.com/repos/${process.argv[2]}/releases`)
    let releasesJson = await releases.json()
    let releasesOpt = []
    if (releases.ok) {
        oneSpinner.success()
    } else{
        oneSpinner.error()
        throw "Failed to get response! Error, or on our part, or on github's part..."
    }
    releasesJson.forEach(element => {
        releasesOpt.push(
            element.tag_name
        )
    })

    return releasesOpt;
}