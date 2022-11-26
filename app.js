const puppeteer = require('puppeteer')
const prompt = require('prompt-sync')();
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: 'YOUR OPENAI API KEY',
  });
const openai = new OpenAIApi(configuration);

var email = 'YOUR LETTERBOXD ACCOUNT EMAIL';
var password = 'YOUR LETTERBOXD ACCOUNT PASSWORD';

// 0.5 estrelas = 800
// 1 estrela = 808
// 1.5 estrelas = 828
// 2 estrelas = 832
// 2.5 estrelas = 852
// 3 estrelas = 860
// 3.5 estrelas = 878
// 4 estrelas = 885
// 4.5 estrelas = 904
// 5 estrelas = 912

async function createReview(){
    var movieName = prompt('Movie name: ');
    var movieReview = prompt('Describe the movie in short sentences: ');
    
    const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Write a deep and long movie review based on these notes in portuguese:\n\nMovie: ${movieName}\n${movieReview}\n\nReview:`,
        temperature: 0.8,
        max_tokens: 2000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      })
    const review = response.data['choices'][0].text
   
    const response2 = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: `Rate a movie between 1 and 10 based on this review: \n\nReview: \"${review}\"\nRating:`,
        temperature: 0.5,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
    })
    const rate = parseInt(response2.data['choices'][0].text)
    logLetterboxd(movieName, review.trim(), rate)
}

createReview()

async function logLetterboxd(movieName, review, rate){
    const notas = [0, 800, 808, 828, 832, 852, 860, 878, 885, 904, 912]
    const nota = notas[rate]
    async function login(){
        console.log('iniciou')
        const loginOpen = '.navitem.sign-in-menu'
        const userSelect = "#username"
        const passwordSelect = "#password"
        const loginButton = ".button.-action.button-green"
        await page.waitForSelector(loginOpen);
        await page.click(loginOpen)
        await page.waitForSelector(userSelect)
        await page.click(userSelect)
        await page.type(userSelect, email)
        await page.click(passwordSelect)
        await page.type(passwordSelect, password)
        await page.click(loginButton)
        await page.waitForSelector("#add-new-button")
        searchFilm()
    }

    async function searchFilm(){
        console.log('procurando filme')
        const addButton = '#add-new-button'
        const search = '#frm-film-name'
        const selectFilm = ".ac_even.ac_over"
        await page.waitForSelector(addButton)
        await page.click(addButton)
        console.log('adicionar')
        await page.waitForSelector(search, {visible: true})
        await page.click(search, {visible: true })
        await page.type(search, movieName)
        console.log('procurar')
        await page.waitForSelector(selectFilm)
        await page.click(selectFilm, {visible: true, delay: 1000})
        await page.waitForSelector("#frm-review")
        logFilm()
    }

    async function logFilm(){
        console.log('fazendo review do filme')
        const reviewText = "#frm-review"
        const save = "#diary-entry-submit-button"
        await page.waitForSelector(reviewText)
        await page.click(reviewText, {visible: true})
        await page.type(reviewText, review, {})
        await page.mouse.click(nota, 562, {delay: 2000})
        await page.click(save, {delay: 1000})
        console.log('clicked')
    }
    const browser = await puppeteer.launch({  })
    const page  = await browser.newPage()
    page.setViewport({width:1280,height:720})
    await page.goto('https://letterboxd.com/', {waitUntil:'load', timeout:60000})
    login()
}

//logLetterboxd()