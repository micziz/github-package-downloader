import inquirer from 'inquirer'
import inquirerPrompt from 'inquirer-search-list';


inquirer.registerPrompt('search-list', inquirerPrompt)

export async function prompt(message, options){
    let response = await inquirer.prompt([
        {
            name: 'release',
            type: 'search-list',
            message: message,
            choices: options,
            source: (answersSoFar, input) => myApi.searchStates(input),
        }
    ])

    return response;
}
export async function promptYesNoe(message){
    let response = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirmDownload',
            message: message,
            default: false,
        },
    ])

    return response;
}