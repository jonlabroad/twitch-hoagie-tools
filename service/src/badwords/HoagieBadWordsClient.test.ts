import HoagieBadWordsClient from "./HoagieBadWordsClient"

const testText1 = `shit Mmm that's good Hey pass me that drink I mean that's some good ass shit I'm eatin' good today, shit ay, yuh [Hook] Call me the Calorie Killa, I be in the kitchen i'm coming to getcha'. yuh Barbecue chips in the pantry Eatin' everything motherfucker you can't stop me. whoa Big boy gotta stay grubbin', homemade chocolate chips in the oven. ooh Pillsbury Doughboy make him go "tee hee", mamma feeding me 'cause i ain't got no money. whoa [Verse 1: Jaboody] Stacking french toast to the ceiling uh, maple syrup out here got me catching feelings. yuh Sweet Baby Ray's on the ribs i'm callin' dibs, man fuck those dumb kids PB&J, ain't afraid of the crust no Got the s'mores on the stove makin' me bust. ooh Drinkin' OJ even though I just brushed Review on Yelp, bitch you know who to trust. yuh [Hook] Call me the Calorie Killa, I be in the kitchen i'm coming to getcha'. yuh Barbecue chips in the pantry Eatin' everything motherfucker you can't stop me. whoa Big boy gotta stay grubbin', homemade chocolate chips in the oven. uh Pillsbury Doughboy make him go \"tee hee\", mamma feeding me 'cause i ain't got no money. whoa [Verse 2: Jaboody] Coupons all up in my wallet`

describe("hoagie bad words", () => {
    test("should work", () => {
        const client = new HoagieBadWordsClient()
        client.eval(testText1)
    })
})