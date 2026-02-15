
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBPO_8mGzTAhCKU_dE9iyUnmJNyS7petWM",
    authDomain: "takoyakihub-a075e.firebaseapp.com",
    projectId: "takoyakihub-a075e",
    storageBucket: "takoyakihub-a075e.firebasestorage.app",
    messagingSenderId: "831373878622",
    appId: "1:831373878622:web:d66b266da0bbc92ee71bcf",
    measurementId: "G-BQ7774ERKY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const MENU_ITEMS = [
    {
        id: "classic",
        name: "Classic Takoyaki",
        nameJp: "たこ焼き",
        description: "Traditional octopus balls with takoyaki sauce, mayo, bonito flakes & green onion",
        price: 120,
        image: "/images/classic.png",
        available: true
    },
    {
        id: "cheese",
        name: "Cheese Takoyaki",
        nameJp: "チーズたこ焼き",
        description: "Loaded with melted mozzarella cheese and our signature sauce blend",
        price: 140,
        image: "/images/cheese.png",
        available: true
    },
    {
        id: "spicy",
        name: "Spicy Takoyaki",
        nameJp: "辛口たこ焼き",
        description: "Fiery chili sauce with togarashi spice blend and sriracha mayo",
        price: 135,
        image: "/images/spicy.png",
        available: true
    },
    {
        id: "teriyaki",
        name: "Teriyaki Takoyaki",
        nameJp: "照り焼きたこ焼き",
        description: "Glazed with sweet teriyaki sauce, sesame seeds & pickled ginger",
        price: 135,
        image: "/images/teriyaki.png",
        available: true
    }
];

async function seed() {
    console.log("Seeding menu items...");
    try {
        for (const item of MENU_ITEMS) {
            await setDoc(doc(db, "menu", item.id), item);
            console.log(`Added: ${item.name}`);
        }
        console.log("Success! Added 4 menu items.");
    } catch (e) {
        console.error("Error seeding database:", e);
    }
    process.exit(0);
}

seed();
