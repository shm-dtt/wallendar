export const sponsors = [
    {
        id: "1",
        name: "Aum Vats",
        avatar: "https://github.com/aumvats.png",
        amount: 250,
        isRecurring: false,
        links: {
        github: "https://github.com/aumvats",
        twitter: "https://twitter.com/aumvats",
        website: "https://aumvats.com",
        }
    },
].sort((a, b) => b.amount - a.amount);