export default async () => {
  const jsonUrl = 'https://indieweb-directory.glitch.me/api/hcards'
  const res = await fetch(jsonUrl)
  const hCards = await res.json()
  const mentions = hCards.map((hCard) => {
    let mention = {
      name: hCard.properties.name[0],
      link: hCard.properties.url[0],
      avatar: hCard.properties.photo[0],
    }
    return mention
  })
  return mentions
}
